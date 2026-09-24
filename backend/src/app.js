const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
const crypto = require('crypto');
const env = require('./config/environment');
const logger = require('./config/logger');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { notFoundHandler, errorMiddleware } = require('./middleware/error.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const organizationRoutes = require('./modules/organizations/organization.routes');
const storeRoutes = require('./modules/stores/store.routes');
const userRoutes = require('./modules/users/user.routes');
const roleRoutes = require('./modules/roles/role.routes');
const permissionRoutes = require('./modules/permissions/permission.routes');
const saleRoutes = require('./modules/sales/sale.routes');
const expenseRoutes = require('./modules/expenses/expense.routes');
const expenseCategoryRoutes = require('./modules/expenseCategories/expenseCategory.routes');
const paymentMethodRoutes = require('./modules/paymentMethods/paymentMethod.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const reportRoutes = require('./modules/reports/reports.routes');

const app = express();

app.set('trust proxy', 1);
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

const allowedOrigins = [...new Set([env.clientUrl, env.appUrl].filter(Boolean))];
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'upgrade-insecure-requests': null,
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        'connect-src': ["'self'", ...allowedOrigins],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(hpp());
app.use(
  morgan(env.isProduction ? 'combined' : 'dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use('/api/v1', apiLimiter);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Smash & Stack API is healthy' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/expense-categories', expenseCategoryRoutes);
app.use('/api/v1/payment-methods', paymentMethodRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);

const clientDist = path.resolve(__dirname, '../../frontend/dist');
const clientIndex = path.join(clientDist, 'index.html');

if (fs.existsSync(clientIndex)) {
  app.use(express.static(clientDist, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
      return next();
    }
    return res.sendFile(clientIndex);
  });
  logger.info(`Serving frontend static build from ${clientDist}`);
} else {
  logger.warn('Frontend build not found. Run `npm run build` in frontend, then restart the API.');
}

app.use(notFoundHandler);
app.use(errorMiddleware);

module.exports = app;
