/**
 * Request Logger Middleware
 * Logs API requests and response times
 */

const { logger } = require('../utils/logger');

/**
 * Request logger middleware
 * @param {Object} ctx - Koa context
 * @param {Function} next - Next middleware function
 */
const requestLogger = async (ctx, next) => {
  const start = Date.now();
  
  try {
    await next();
  } finally {
    const duration = Date.now() - start;
    logger.logRequest(ctx, duration);
  }
};

module.exports = requestLogger;
