/**
 * PEA Electricity Controller (Strategy Pattern V2)
 * Handles PEA electricity bill calculation requests using Strategy Pattern
 */

const { getStrategy, getAvailableStrategies } = require('../strategy-selector');
const ValidationEngine = require('../services/validation/validation-engine');

/**
 * Calculate electricity bill for different types using strategy pattern
 */
async function calculateElectricityBill(ctx, calculationType) {
  try {
    const { tariffType, voltageLevel, ...params } = ctx.request.body;

    // Use validation engine for comprehensive validation
    const validator = new ValidationEngine();
    const validationErrors = validator.validate(calculationType, tariffType, voltageLevel, params);

    if (validationErrors.length > 0) {
      ctx.status = 400;
      ctx.body = validator.getErrorResponse();
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
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Type 2 only supports TOU tariff`,
          timestamp: new Date().toISOString()
        };
        return;
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
        // Check if this is advanced TOU (has onPeakKwh and offPeakKwh) or basic TOU (has kwh)
        if (params.onPeakKwh !== undefined && params.offPeakKwh !== undefined) {
          strategyName = `PEA_5.2.${voltageCode}_specific_TOU`;
        } else {
          strategyName = `PEA_5.1.${voltageCode}_specific_TOU`;
        }
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Type 5 only supports TOU tariff`,
          timestamp: new Date().toISOString()
        };
        return;
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
    if (!strategy) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Strategy not found: ${strategyName}. Please check the strategy name and ensure the file exists.`,
        timestamp: new Date().toISOString()
      };
      return;
    }

    // Execute strategy calculation
    const result = await strategy.calculate(params);

    // Add metadata to response
    ctx.body = {
      success: true,
      data: {
        ...result,
        strategyUsed: strategyName,
        calculationType: calculationType,
        tariffType: tariffType,
        voltageLevel: voltageLevel,
        provider: 'PEA'
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in PEA calculation:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error during calculation',
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

    const strategiesByType = {
      'type-2': ['PEA_2.2.1_small_TOU', 'PEA_2.2.2_small_TOU', 'PEA_2.2.3_small_TOU'],
      'type-3': ['PEA_3.1.1_medium_normal', 'PEA_3.1.2_medium_normal', 'PEA_3.1.3_medium_normal', 'PEA_3.2.1_medium_TOU', 'PEA_3.2.2_medium_TOU', 'PEA_3.2.3_medium_TOU'],
      'type-4': ['PEA_4.1.1_large_TOD', 'PEA_4.1.2_large_TOD', 'PEA_4.1.3_large_TOD', 'PEA_4.2.1_large_TOU', 'PEA_4.2.2_large_TOU', 'PEA_4.2.3_large_TOU'],
      'type-5': ['PEA_5.1.1_specific_TOU', 'PEA_5.1.2_specific_TOU', 'PEA_5.1.3_specific_TOU', 'PEA_5.2.1_specific_TOU', 'PEA_5.2.2_specific_TOU', 'PEA_5.2.3_specific_TOU']
    };

    const voltageLevelsByType = {
      'type-2': ['<22kV', '22-33kV', '>=69kV'],
      'type-3': ['<22kV', '22-33kV', '>=69kV'],
      'type-4': ['<22kV', '22-33kV', '>=69kV'],
      'type-5': ['<22kV', '22-33kV', '>=69kV']
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
        availableTariffTypes: availableTypes,
        strategies: strategiesByType[calculationType] || [],
        voltageLevels: voltageLevelsByType[calculationType] || []
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
 * Get all available PEA strategies
 */
async function getAllStrategies(ctx) {
  try {
    const strategies = [
      // Type 2 - Small Business (only TOU supported)
      'PEA_2.2.1_small_TOU', // <22kV
      'PEA_2.2.2_small_TOU', // 22-33kV
      'PEA_2.2.3_small_TOU', // >=69kV
      
      // Type 3 - Medium Business
      'PEA_3.1.1_medium_normal', // <22kV
      'PEA_3.1.2_medium_normal', // 22-33kV
      'PEA_3.1.3_medium_normal', // >=69kV
      'PEA_3.2.1_medium_TOU',   // <22kV
      'PEA_3.2.2_medium_TOU',   // 22-33kV
      'PEA_3.2.3_medium_TOU',   // >=69kV
      
      // Type 4 - Large Business
      'PEA_4.1.1_large_TOD',    // <22kV
      'PEA_4.1.2_large_TOD',    // 22-33kV
      'PEA_4.1.3_large_TOD',    // >=69kV
      'PEA_4.2.1_large_TOU',    // <22kV
      'PEA_4.2.2_large_TOU',    // 22-33kV
      'PEA_4.2.3_large_TOU',    // >=69kV
      
      // Type 5 - Specific Business (only TOU supported)
      'PEA_5.1.1_specific_TOU', // <22kV
      'PEA_5.1.2_specific_TOU', // 22-33kV
      'PEA_5.1.3_specific_TOU', // >=69kV
      'PEA_5.2.1_specific_TOU', // <22kV
      'PEA_5.2.2_specific_TOU', // 22-33kV
      'PEA_5.2.3_specific_TOU'  // >=69kV
    ];
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        provider: 'PEA',
        strategies: strategies,
        count: strategies.length,
        calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5'],
        tariffTypes: ['normal', 'tou', 'tod'],
        voltageLevels: ['<22kV', '22-33kV', '>=69kV']
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to retrieve strategies',
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
  getAvailableTariffTypes,
  getAllStrategies
};
