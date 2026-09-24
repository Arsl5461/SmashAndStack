const mongoose = require('mongoose');
const logger = require('./logger');
const env = require('./environment');

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: !env.isProduction,
  });
  logger.info('MongoDB connected');
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
