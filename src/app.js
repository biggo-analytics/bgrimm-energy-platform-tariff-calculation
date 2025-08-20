const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');

const routes = require('./routes');

const app = new Koa();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser());

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString()
    };
    ctx.app.emit('error', err, ctx);
  }
});

// Request logging middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
});

// Routes
app.use(routes.routes());
app.use(routes.allowedMethods());

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`📋 API info available at http://localhost:${PORT}/api/info`);
});

module.exports = app;
