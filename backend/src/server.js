const env = require('./config/environment');
const logger = require('./config/logger');
const { connectDatabase } = require('./config/database');
const { normalizePaymentMethodNames } = require('./database/migrations/normalizePaymentMethods');
const { ensureExpenseCategories } = require('./database/migrations/ensureExpenseCategories');
const { syncSystemRoles } = require('./database/migrations/syncSystemRoles');
const app = require('./app');

async function start() {
  await connectDatabase();
  await syncSystemRoles();
  await normalizePaymentMethodNames();
  await ensureExpenseCategories();
  const server = app.listen(env.port, '0.0.0.0', () => {
    logger.info(`${env.appName} listening on http://0.0.0.0:${env.port}`);
  });

  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  logger.error(error);
  process.exit(1);
});
