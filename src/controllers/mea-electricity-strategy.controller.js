/**
 * MEA Electricity Controller (Strategy Pattern V2)
 * Handles MEA electricity bill calculation requests using Strategy Pattern
 */

const { getStrategy, getAvailableStrategies } = require('../strategy-selector');

/**
 * Calculate electricity bill for different types using strategy pattern
 */
async function calculateElectricityBill(ctx, calculationType) {
  try {
    const { tariffType, voltageLevel, ...params } = ctx.request.body;

    // Validate required parameters
    if (!tariffType || !voltageLevel) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Missing required parameters: tariffType, voltageLevel',
        timestamp: new Date().toISOString()
      };
      return;
    }

    // Map voltage levels to strategy naming convention
    const voltageMap = {
      '<12kV': '3',
      '12-24kV': '2', 
      '>=69kV': '1'
    };

    const voltageCode = voltageMap[voltageLevel];
    if (!voltageCode) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Invalid voltage level: ${voltageLevel}. Supported: <12kV, 12-24kV, >=69kV`,
        timestamp: new Date().toISOString()
      };
      return;
    }

    // Build strategy name
    const tariffTypeMap = {
      'normal': 'normal',
      'tou': 'TOU',
      'tod': 'TOD'
    };

    const strategyTariff = tariffTypeMap[tariffType];
    if (!strategyTariff) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Invalid tariff type: ${tariffType}. Supported: normal, tou, tod`,
        timestamp: new Date().toISOString()
      };
      return;
    }

    const typeMap = {
      'type-2': '2.2',
      'type-3': calculationType === 'type-3' && tariffType === 'normal' ? '3.1' : '3.2',
      'type-4': calculationType === 'type-4' && tariffType === 'tod' ? '4.1' : '4.2',
      'type-5': calculationType === 'type-5' && tariffType === 'normal' ? '5.1' : '5.2'
    };

    const typeCode = typeMap[calculationType];
    const strategyName = `MEA_${typeCode}.${voltageCode}_${calculationType.replace('type-', '')}${strategyTariff === 'normal' ? '_normal' : `_${strategyTariff}`}`;

    // Get and execute strategy
    const strategy = getStrategy(strategyName);
    const result = strategy.calculate(params);

    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        calculationType,
        tariffType,
        voltageLevel,
        totalAmount: result,
        strategyUsed: strategyName
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get MEA service information
 */
async function getServiceInfo(ctx) {
  try {
    const availableStrategies = getAvailableStrategies();
    const meaStrategies = availableStrategies.mea;
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        provider: 'MEA',
        description: 'Metropolitan Electricity Authority',
        availableStrategies: meaStrategies.length,
        strategies: meaStrategies,
        voltageOptions: ['<12kV', '12-24kV', '>=69kV'],
        tariffTypes: ['normal', 'tou', 'tod'],
        calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5']
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to retrieve service information',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get rate information for all MEA strategies
 */
async function getRateInfo(ctx) {
  try {
    const meaConfig = require('../strategies/_config-mea-rates');
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        provider: 'MEA',
        rateConfigurations: meaConfig
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get available tariff types for calculation type
 */
async function getAvailableTariffTypes(ctx) {
  try {
    const { calculationType } = ctx.params;
    
    if (!calculationType) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Missing calculationType parameter',
        timestamp: new Date().toISOString()
      };
      return;
    }

    const tariffTypesByType = {
      'type-2': ['tou'],
      'type-3': ['normal', 'tou'],
      'type-4': ['tod', 'tou'],
      'type-5': ['normal', 'tou']
    };

    const availableTypes = tariffTypesByType[calculationType];
    if (!availableTypes) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Invalid calculation type: ${calculationType}`,
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        calculationType,
        availableTariffTypes: availableTypes
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  calculateType2: (ctx) => calculateElectricityBill(ctx, 'type-2'),
  calculateType3: (ctx) => calculateElectricityBill(ctx, 'type-3'),
  calculateType4: (ctx) => calculateElectricityBill(ctx, 'type-4'),
  calculateType5: (ctx) => calculateElectricityBill(ctx, 'type-5'),
  getServiceInfo,
  getRateInfo,
  getAvailableTariffTypes
};
