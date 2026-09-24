const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5001,
  appName: process.env.APP_NAME || 'Smash & Stack API',
  appUrl: process.env.APP_URL || 'http://localhost:5001',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5174',
  mongoUri: process.env.MONGO_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  },
  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME || 'Smash & Stack Owner',
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@smashandstack.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'SmashStack!123',
  },
  uploadDriver: process.env.UPLOAD_DRIVER || 'local',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  seedDemoData: process.env.SEED_DEMO_DATA === 'true',
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 2000,
  },
});

module.exports = env;
