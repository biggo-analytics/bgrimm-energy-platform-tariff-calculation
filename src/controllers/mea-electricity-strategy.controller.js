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

    // Build strategy name based on actual strategy files
    let strategyName;
    
    if (calculationType === 'type-2') {
      if (tariffType === 'tou') {
        if (voltageLevel === '<12kV') {
          strategyName = 'MEA_2.2.1_small_TOU';
        } else if (voltageLevel === '12-24kV') {
          strategyName = 'MEA_2.2.2_small_TOU';
        }
      }
    } else if (calculationType === 'type-3') {
      if (tariffType === 'normal') {
        if (voltageLevel === '>=69kV') {
          strategyName = 'MEA_3.1.1_medium_normal';
        } else if (voltageLevel === '12-24kV') {
          strategyName = 'MEA_3.1.2_medium_normal';
        } else if (voltageLevel === '<12kV') {
          strategyName = 'MEA_3.1.3_medium_normal';
        }
      } else if (tariffType === 'tou') {
        if (voltageLevel === '>=69kV') {
          strategyName = 'MEA_3.2.1_medium_TOU';
        } else if (voltageLevel === '12-24kV') {
          strategyName = 'MEA_3.2.2_medium_TOU';
        } else if (voltageLevel === '<12kV') {
          strategyName = 'MEA_3.2.3_medium_TOU';
        }
      }
    } else if (calculationType === 'type-4') {
      if (tariffType === 'tod') {
        if (voltageLevel === '>=69kV') {
          strategyName = 'MEA_4.1.1_large_TOD';
        } else if (voltageLevel === '12-24kV') {
          strategyName = 'MEA_4.1.2_large_TOD';
        } else if (voltageLevel === '<12kV') {
          strategyName = 'MEA_4.1.3_large_TOD';
        }
      } else if (tariffType === 'tou') {
        if (voltageLevel === '>=69kV') {
          strategyName = 'MEA_4.2.1_large_TOU';
        } else if (voltageLevel === '12-24kV') {
          strategyName = 'MEA_4.2.2_large_TOU';
        } else if (voltageLevel === '<12kV') {
          strategyName = 'MEA_4.2.3_large_TOU';
        }
      }
    } else if (calculationType === 'type-5') {
      if (tariffType === 'normal') {
        if (voltageLevel === '>=69kV') {
          strategyName = 'MEA_5.1.1_specific_normal';
        } else if (voltageLevel === '12-24kV') {
          strategyName = 'MEA_5.1.2_specific_normal';
        } else if (voltageLevel === '<12kV') {
          strategyName = 'MEA_5.1.3_specific_normal';
        }
      } else if (tariffType === 'tou') {
        if (voltageLevel === '>=69kV') {
          strategyName = 'MEA_5.2.1_specific_TOU';
        } else if (voltageLevel === '12-24kV') {
          strategyName = 'MEA_5.2.2_specific_TOU';
        } else if (voltageLevel === '<12kV') {
          strategyName = 'MEA_5.2.3_specific_TOU';
        }
      }
    }

    if (!strategyName) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Invalid combination: ${calculationType} with ${tariffType} for ${voltageLevel}`,
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
