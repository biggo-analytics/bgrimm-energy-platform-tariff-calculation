const Router = require('@koa/router');
const apiRoutes = require('./api.routes');

const router = new Router();

// Health check route
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

// API routes (strategy pattern - now the main API)
router.use(apiRoutes.routes(), apiRoutes.allowedMethods());

module.exports = router;
