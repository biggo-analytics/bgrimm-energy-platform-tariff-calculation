const Router = require('@koa/router');
const apiStrategyRoutes = require('./api-strategy.routes');

const router = new Router();

// Health check route
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

// API routes (strategy pattern v2 only)
router.use(apiStrategyRoutes.routes(), apiStrategyRoutes.allowedMethods());

module.exports = router;
