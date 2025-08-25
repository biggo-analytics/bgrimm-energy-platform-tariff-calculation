const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');

const routes = require('./routes');
const requestLogger = require('./middleware/request-logger');
const { handleError } = require('./utils/error-handler');
const { logger } = require('./utils/logger');

const app = new Koa();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser());

// Request logging middleware
app.use(requestLogger);

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    handleError(ctx, err);
    ctx.app.emit('error', err, ctx);
  }
});

// Routes
app.use(routes.routes());
app.use(routes.allowedMethods());

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
    logger.info(`📋 API info available at http://localhost:${PORT}/api/info`);
  });
}

module.exports = app;
