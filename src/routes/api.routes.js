/**
 * API Routes with Strategy Pattern
 * Enhanced API routes using the strategy-based controllers
 */

const Router = require('@koa/router');
const electricityController = require('../controllers/electricity.controller');

const router = new Router({
  prefix: '/api' // Main API with strategy pattern
});

// Universal calculation endpoint that works for both MEA and PEA
router.post('/:provider/calculate/:calculationType', electricityController.calculateBill);

// Service information endpoint
router.get('/info', electricityController.getServiceInfo);

// Strategy discovery endpoints
router.get('/strategies/:provider', electricityController.getAvailableStrategies);
router.get('/strategies/calculation-type/:calculationType', electricityController.getStrategiesForCalculationType);

// Validation endpoint
router.get('/validate', electricityController.validateCombination);

// API Health Check and Information
router.get('/health', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    success: true,
    message: 'Strategy Pattern API is healthy',
    version: '3.0.0',
    features: [
      'Strategy Pattern Implementation',
      'Unified Strategy Location',
      'Shared Calculation Utilities',
      'Configuration-Driven Strategies',
      'Enhanced Error Handling',
      'Strategy Discovery APIs',
      'Combination Validation'
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
      version: '3.0.0',
      description: 'Strategy Pattern Implementation for Electricity Tariff Calculation',
      providers: ['MEA', 'PEA'],
      calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5'],
      tariffTypes: ['normal', 'tou', 'tod'],
      features: {
        strategyPattern: true,
        unifiedStrategyLocation: true,
        sharedCalculationUtils: true,
        configurationDriven: true,
        maintainableCode: true,
        enhancedValidation: true,
        strategyDiscovery: true,
        combinationValidation: true
      },
      endpoints: {
        calculate: '/api/{provider}/calculate/{calculationType}',
        info: '/api/info',
        health: '/api/health',
        strategies: {
          byProvider: '/api/strategies/{provider}',
          byCalculationType: '/api/strategies/calculation-type/{calculationType}'
        },
        validate: '/api/validate?provider={provider}&calculationType={type}&tariffType={tariff}&voltageLevel={voltage}'
      },
      examples: {
        calculate: {
          url: '/api/MEA/calculate/type-2',
          method: 'POST',
          body: {
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 39.72,
            usage: {
              on_peak_kwh: 200,
              off_peak_kwh: 300
            }
          }
        },
        validate: {
          url: '/api/validate?provider=PEA&calculationType=type-3&tariffType=normal&voltageLevel=22-33kV',
          method: 'GET'
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
      current: {
        endpoint: '/api',
        description: 'Strategy Pattern implementation',
        features: [
          'Strategy pattern',
          'Unified strategy location',
          'Shared calculation utilities',
          'Configuration-driven strategies',
          'Enhanced maintainability',
          'Strategy discovery APIs',
          'Combination validation',
          '42 individual strategy classes'
        ]
      },
      migration: {
        status: 'Complete',
        recommendation: 'Use current API for all integrations',
        note: 'Legacy APIs have been removed and replaced with strategy pattern'
      }
    },
    timestamp: new Date().toISOString()
  };
});

module.exports = router;
