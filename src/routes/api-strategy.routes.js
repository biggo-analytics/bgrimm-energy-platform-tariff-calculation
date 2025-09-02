/**
 * API Routes with Strategy Pattern
 * Enhanced API routes using the new strategy-based controllers
 */

const Router = require('@koa/router');
const meaStrategyController = require('../controllers/mea-electricity-strategy.controller');
const peaStrategyController = require('../controllers/pea-electricity-strategy.controller');

const router = new Router({
  prefix: '/api/v2' // Version 2 API with strategy pattern
});

// MEA Strategy-based Routes
const meaRouter = new Router({
  prefix: '/mea'
});

// MEA Calculation endpoints
meaRouter.post('/calculate/type-2', meaStrategyController.calculateType2);
meaRouter.post('/calculate/type-3', meaStrategyController.calculateType3);
meaRouter.post('/calculate/type-4', meaStrategyController.calculateType4);
meaRouter.post('/calculate/type-5', meaStrategyController.calculateType5);

// MEA Information endpoints
meaRouter.get('/info', meaStrategyController.getServiceInfo);
meaRouter.get('/rates', meaStrategyController.getRateInfo);
meaRouter.get('/tariff-types/:calculationType', meaStrategyController.getAvailableTariffTypes);
meaRouter.get('/strategies', meaStrategyController.getAllStrategies);

// PEA Strategy-based Routes
const peaRouter = new Router({
  prefix: '/pea'
});

// PEA Calculation endpoints
peaRouter.post('/calculate/type-2', peaStrategyController.calculateType2);
peaRouter.post('/calculate/type-3', peaStrategyController.calculateType3);
peaRouter.post('/calculate/type-4', peaStrategyController.calculateType4);
peaRouter.post('/calculate/type-5', peaStrategyController.calculateType5);

// PEA Information endpoints
peaRouter.get('/info', peaStrategyController.getServiceInfo);
peaRouter.get('/rates', peaStrategyController.getRateInfo);
peaRouter.get('/tariff-types/:calculationType', peaStrategyController.getAvailableTariffTypes);
peaRouter.get('/strategies', peaStrategyController.getAllStrategies);

// API Health Check and Information
router.get('/health', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    success: true,
    message: 'Strategy Pattern API is healthy',
    version: '2.0.0',
    features: [
      'Strategy Pattern Implementation',
      'Enhanced Error Handling',
      'Service Information APIs',
      'Rate Information APIs',
      'Tariff Type Discovery'
    ],
    timestamp: new Date().toISOString()
  };
});

// API Information endpoint
router.get('/info', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    success: true,
    data: {
      version: '2.0.0',
      description: 'Enhanced Electricity Tariff Calculation API with Strategy Pattern',
      providers: ['MEA', 'PEA'],
      calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5'],
      tariffTypes: ['normal', 'tou', 'tod'],
      features: {
        strategyPattern: true,
        enhancedValidation: true,
        serviceDiscovery: true,
        rateInformation: true,
        errorHandling: 'Enhanced'
      },
      endpoints: {
        mea: {
          calculate: '/api/v2/mea/calculate/{type}',
          info: '/api/v2/mea/info',
          rates: '/api/v2/mea/rates',
          tariffTypes: '/api/v2/mea/tariff-types/{calculationType}'
        },
        pea: {
          calculate: '/api/v2/pea/calculate/{type}',
          info: '/api/v2/pea/info',
          rates: '/api/v2/pea/rates',
          tariffTypes: '/api/v2/pea/tariff-types/{calculationType}'
        }
      }
    },
    timestamp: new Date().toISOString()
  };
});

// Comparison endpoint (for migration testing)
router.get('/compare', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    success: true,
    data: {
      v1: {
        endpoint: '/api',
        description: 'Original implementation',
        features: ['Basic calculations', 'Legacy architecture']
      },
      v2: {
        endpoint: '/api/v2',
        description: 'Strategy Pattern implementation',
        features: [
          'Strategy Pattern architecture',
          'Enhanced error handling',
          'Service discovery APIs',
          'Rate information APIs',
          'Better validation',
          'Improved extensibility'
        ]
      },
      migration: {
        status: 'Available',
        recommendation: 'Use v2 for new integrations',
        note: 'v1 remains available for backward compatibility'
      }
    },
    timestamp: new Date().toISOString()
  };
});

// Mount sub-routers
router.use(meaRouter.routes());
router.use(peaRouter.routes());

// Catch-all handler for unsupported calculation types
router.post('/mea/calculate/:calculationType', async (ctx) => {
  const { calculationType } = ctx.params;
  const supportedTypes = ['type-2', 'type-3', 'type-4', 'type-5'];
  
  if (!supportedTypes.includes(calculationType)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: 'Unsupported Calculation Type',
      message: `${calculationType} is not supported. Supported types: ${supportedTypes.join(', ')}`,
      timestamp: new Date().toISOString()
    };
    return;
  }
  
  // If we reach here, the calculation type is supported but no specific handler was found
  ctx.status = 400;
  ctx.body = {
    success: false,
    error: 'Invalid Request',
    message: `Invalid request for ${calculationType}`,
    timestamp: new Date().toISOString()
  };
});

router.post('/pea/calculate/:calculationType', async (ctx) => {
  const { calculationType } = ctx.params;
  const supportedTypes = ['type-2', 'type-3', 'type-4', 'type-5'];
  
  if (!supportedTypes.includes(calculationType)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: 'Unsupported Calculation Type',
      message: `${calculationType} is not supported. Supported types: ${supportedTypes.join(', ')}`,
      timestamp: new Date().toISOString()
    };
    return;
  }
  
  // If we reach here, the calculation type is supported but no specific handler was found
  ctx.status = 400;
  ctx.body = {
    success: false,
    error: 'Invalid Request',
    message: `Invalid request for ${calculationType}`,
    timestamp: new Date().toISOString()
  };
});

module.exports = router;
