/**
 * Performance Monitoring Middleware
 * Tracks request response times and memory usage
 */

const { logger } = require('../utils/logger');

/**
 * Performance monitoring middleware
 * @param {Object} ctx - Koa context
 * @param {Function} next - Next middleware
 */
const performanceMiddleware = async (ctx, next) => {
  const start = process.hrtime.bigint();
  const startMemory = process.memoryUsage();
  
  await next();
  
  const end = process.hrtime.bigint();
  const endMemory = process.memoryUsage();
  
  const responseTime = Number(end - start) / 1000000; // Convert to milliseconds
  const memoryDiff = {
    rss: endMemory.rss - startMemory.rss,
    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
    external: endMemory.external - startMemory.external
  };
  
  // Log performance metrics for calculation endpoints
  if (ctx.path.includes('/calculate/')) {
    logger.info('Performance metrics', {
      method: ctx.method,
      url: ctx.path,
      status: ctx.status,
      responseTime: `${responseTime.toFixed(2)}ms`,
      memoryUsage: {
        rss: `${Math.round(endMemory.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`,
        memoryDelta: `${Math.round(memoryDiff.heapUsed / 1024)}KB`
      },
      cached: ctx.body && ctx.body.cached ? true : false
    });
  }
  
  // Warn on slow requests
  if (responseTime > 1000) {
    logger.warn('Slow request detected', {
      url: ctx.path,
      responseTime: `${responseTime.toFixed(2)}ms`,
      memoryDelta: `${Math.round(memoryDiff.heapUsed / 1024)}KB`
    });
  }
  
  // Add performance headers
  ctx.set('X-Response-Time', `${responseTime.toFixed(2)}ms`);
  ctx.set('X-Memory-Usage', `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`);
};

module.exports = performanceMiddleware;