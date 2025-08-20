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

// API routes
router.use('/api', apiRoutes.routes(), apiRoutes.allowedMethods());

module.exports = router;
