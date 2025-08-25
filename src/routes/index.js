const Router = require('@koa/router');
const apiRoutes = require('./api.routes');
const apiStrategyRoutes = require('./api-strategy.routes');

const router = new Router();

// Health check route
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

// API routes (original v1)
router.use('/api', apiRoutes.routes(), apiRoutes.allowedMethods());

// API routes (strategy pattern v2)
router.use(apiStrategyRoutes.routes(), apiStrategyRoutes.allowedMethods());

module.exports = router;
