/**
 * API Routes with Strategy Pattern
 * Enhanced API routes using the strategy-based controllers
 */

const Router = require('@koa/router');
const electricityController = require('../controllers/electricity.controller');

const router = new Router({
  prefix: '/api' // Main API with strategy pattern
});

// Universal calculation endpoint using tariff plan name
router.post('/calculate/:tariffPlanName', electricityController.calculateBill);

// Service information endpoint
router.get('/info', electricityController.getServiceInfo);

// Tariff plan discovery endpoints
router.get('/tariff-plans', electricityController.getAllTariffPlans);
router.get('/tariff-plans/:tariffPlanName', electricityController.getTariffPlanInfo);
router.get('/tariff-plans/:provider', electricityController.getAvailableStrategies);
router.get('/tariff-plans/calculation-type/:calculationType', electricityController.getStrategiesForCalculationType);

// Validation endpoint
router.get('/validate', electricityController.validateTariffPlan);

// API Health Check and Information
router.get('/health', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    success: true,
    message: 'Dynamic Strategy Pattern API is healthy',
    version: '4.0.0',
    features: [
      'Dynamic Strategy Pattern Implementation',
      'File System Based Strategy Discovery',
      'Auto-Loading Strategy Classes',
      'Shared Calculation Utilities',
      'Configuration-Driven Strategies',
      'Enhanced Error Handling',
      'Tariff Plan Discovery APIs',
      'Dynamic Validation'
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
      version: '4.0.0',
      description: 'Dynamic Strategy Pattern Implementation for Electricity Tariff Calculation',
      providers: ['MEA', 'PEA'],
      features: {
        dynamicStrategyPattern: true,
        fileSystemBasedDiscovery: true,
        autoLoadingStrategyClasses: true,
        sharedCalculationUtils: true,
        configurationDriven: true,
        maintainableCode: true,
        enhancedValidation: true,
        tariffPlanDiscovery: true,
        dynamicValidation: true
      },
      endpoints: {
        calculate: '/api/calculate/{tariffPlanName}',
        info: '/api/info',
        health: '/api/health',
        tariffPlans: {
          all: '/api/tariff-plans',
          byName: '/api/tariff-plans/{tariffPlanName}',
          byProvider: '/api/tariff-plans/{provider}',
          byCalculationType: '/api/tariff-plans/calculation-type/{calculationType}'
        },
        validate: '/api/validate?tariffPlanName={tariffPlanName}'
      },
      examples: {
        calculate: {
          url: '/api/calculate/MEA_2.2.1_small_TOU',
          method: 'POST',
          body: {
            ftRateSatang: 39.72,
            usage: {
              on_peak_kwh: 200,
              off_peak_kwh: 300
            }
          }
        },
        validate: {
          url: '/api/validate?tariffPlanName=PEA_3.1.1_medium_normal',
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
        description: 'Dynamic Strategy Pattern implementation',
        features: [
          'Dynamic strategy pattern',
          'File system based discovery',
          'Auto-loading strategy classes',
          'Shared calculation utilities',
          'Configuration-driven strategies',
          'Enhanced maintainability',
          'Tariff plan discovery APIs',
          'Dynamic validation',
          '42 individual strategy classes'
        ]
      },
      migration: {
        status: 'Complete',
        recommendation: 'Use current API for all integrations',
        note: 'Legacy APIs have been removed and replaced with dynamic strategy pattern'
      }
    },
    timestamp: new Date().toISOString()
  };
});

module.exports = router;
