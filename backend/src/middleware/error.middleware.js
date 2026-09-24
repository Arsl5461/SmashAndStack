const logger = require('../config/logger');
const env = require('../config/environment');
const ApiResponse = require('../utils/ApiResponse');
const { AppError } = require('../utils/AppError');

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

function errorMiddleware(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Receipt must be 5 MB or smaller',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong';

  logger.error({
    message: err.message,
    statusCode,
    stack: err.stack,
    requestId: req.id,
    path: req.originalUrl,
  });

  return ApiResponse.error(res, {
    statusCode,
    message,
    errors: err.errors || (env.isProduction ? [] : [{ stack: err.stack }]),
  });
}

module.exports = {
  notFoundHandler,
  errorMiddleware,
};
