/**
 * PEA Electricity Controller (Strategy Pattern V2)
 * Handles PEA electricity bill calculation requests using Strategy Pattern
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
      '<22kV': '1',
      '22-33kV': '2', 
      '>=69kV': '3'
    };

    const voltageCode = voltageMap[voltageLevel];
    if (!voltageCode) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Invalid voltage level: ${voltageLevel}. Supported: <22kV, 22-33kV, >=69kV`,
        timestamp: new Date().toISOString()
      };
      return;
    }

    // Build strategy name based on actual strategy files
    let strategyName;
    
    if (calculationType === 'type-2') {
      if (tariffType === 'tou') {
        strategyName = `PEA_2.2.${voltageCode}_small_TOU`;
      } else {
        strategyName = `PEA_2.1.${voltageCode}_small_normal`;
      }
    } else if (calculationType === 'type-3') {
      if (tariffType === 'normal') {
        strategyName = `PEA_3.1.${voltageCode}_medium_normal`;
      } else if (tariffType === 'tou') {
        strategyName = `PEA_3.2.${voltageCode}_medium_TOU`;
      }
    } else if (calculationType === 'type-4') {
      if (tariffType === 'tod') {
        strategyName = `PEA_4.1.${voltageCode}_large_TOD`;
      } else if (tariffType === 'tou') {
        strategyName = `PEA_4.2.${voltageCode}_large_TOU`;
      }
    } else if (calculationType === 'type-5') {
      if (tariffType === 'tou') {
        strategyName = `PEA_5.1.${voltageCode}_specific_TOU`;
      }
    }

    if (!strategyName) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Invalid combination: ${calculationType} with ${tariffType}`,
        timestamp: new Date().toISOString()
      };
      return;
    }

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
 * Get PEA service information
 */
async function getServiceInfo(ctx) {
  try {
    const availableStrategies = getAvailableStrategies();
    const peaStrategies = availableStrategies.pea;
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        provider: 'PEA',
        description: 'Provincial Electricity Authority',
        availableStrategies: peaStrategies.length,
        strategies: peaStrategies,
        voltageOptions: ['<22kV', '22-33kV', '>=69kV'],
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
 * Get rate information for all PEA strategies
 */
async function getRateInfo(ctx) {
  try {
    const peaConfig = require('../strategies/_config-pea-rates');
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        provider: 'PEA',
        rateConfigurations: peaConfig
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
