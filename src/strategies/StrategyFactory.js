/**
 * Strategy Factory
 * Factory function to select and instantiate the correct strategy class
 * based on provider, calculation type, tariff model, and voltage level
 */

const { logger } = require('../utils/logger');

// Import all strategy classes
const PEA_2_2_1_small_TOU = require('./PEA_2.2.1_small_TOU');
const PEA_2_2_2_small_TOU = require('./PEA_2.2.2_small_TOU');
const PEA_3_1_1_medium_normal = require('./PEA_3.1.1_medium_normal');
const PEA_3_1_2_medium_normal = require('./PEA_3.1.2_medium_normal');
const PEA_3_1_3_medium_normal = require('./PEA_3.1.3_medium_normal');
const PEA_3_2_1_medium_TOU = require('./PEA_3.2.1_medium_TOU');
const PEA_3_2_2_medium_TOU = require('./PEA_3.2.2_medium_TOU');
const PEA_3_2_3_medium_TOU = require('./PEA_3.2.3_medium_TOU');
const PEA_4_1_1_large_TOD = require('./PEA_4.1.1_large_TOD');
const PEA_4_1_2_large_TOD = require('./PEA_4.1.2_large_TOD');
const PEA_4_1_3_large_TOD = require('./PEA_4.1.3_large_TOD');
const PEA_4_2_1_large_TOU = require('./PEA_4.2.1_large_TOU');
const PEA_4_2_2_large_TOU = require('./PEA_4.2.2_large_TOU');
const PEA_4_2_3_large_TOU = require('./PEA_4.2.3_large_TOU');
const PEA_5_1_1_specific_TOU = require('./PEA_5.1.1_specific_TOU');
const PEA_5_1_2_specific_TOU = require('./PEA_5.1.2_specific_TOU');
const PEA_5_1_3_specific_TOU = require('./PEA_5.1.3_specific_TOU');
const PEA_5_2_1_specific_TOU = require('./PEA_5.2.1_specific_TOU');
const PEA_5_2_2_specific_TOU = require('./PEA_5.2.2_specific_TOU');
const PEA_5_2_3_specific_TOU = require('./PEA_5.2.3_specific_TOU');

const MEA_2_2_1_small_TOU = require('./MEA_2.2.1_small_TOU');
const MEA_2_2_2_small_TOU = require('./MEA_2.2.2_small_TOU');
const MEA_3_1_1_medium_normal = require('./MEA_3.1.1_medium_normal');
const MEA_3_1_2_medium_normal = require('./MEA_3.1.2_medium_normal');
const MEA_3_1_3_medium_normal = require('./MEA_3.1.3_medium_normal');
const MEA_3_2_1_medium_TOU = require('./MEA_3.2.1_medium_TOU');
const MEA_3_2_2_medium_TOU = require('./MEA_3.2.2_medium_TOU');
const MEA_3_2_3_medium_TOU = require('./MEA_3.2.3_medium_TOU');
const MEA_4_1_1_large_TOD = require('./MEA_4.1.1_large_TOD');
const MEA_4_1_2_large_TOD = require('./MEA_4.1.2_large_TOD');
const MEA_4_1_3_large_TOD = require('./MEA_4.1.3_large_TOD');
const MEA_4_2_1_large_TOU = require('./MEA_4.2.1_large_TOU');
const MEA_4_2_2_large_TOU = require('./MEA_4.2.2_large_TOU');
const MEA_4_2_3_large_TOU = require('./MEA_4.2.3_large_TOU');
const MEA_5_1_1_specific_normal = require('./MEA_5.1.1_specific_normal');
const MEA_5_1_2_specific_normal = require('./MEA_5.1.2_specific_normal');
const MEA_5_1_3_specific_normal = require('./MEA_5.1.3_specific_normal');
const MEA_5_2_1_specific_TOU = require('./MEA_5.2.1_specific_TOU');
const MEA_5_2_2_specific_TOU = require('./MEA_5.2.2_specific_TOU');
const MEA_5_2_3_specific_TOU = require('./MEA_5.2.3_specific_TOU');

// Strategy registry mapping
const STRATEGY_REGISTRY = {
  // PEA Strategies
  'PEA_2.2.1_small_TOU': PEA_2_2_1_small_TOU,
  'PEA_2.2.2_small_TOU': PEA_2_2_2_small_TOU,
  'PEA_3.1.1_medium_normal': PEA_3_1_1_medium_normal,
  'PEA_3.1.2_medium_normal': PEA_3_1_2_medium_normal,
  'PEA_3.1.3_medium_normal': PEA_3_1_3_medium_normal,
  'PEA_3.2.1_medium_TOU': PEA_3_2_1_medium_TOU,
  'PEA_3.2.2_medium_TOU': PEA_3_2_2_medium_TOU,
  'PEA_3.2.3_medium_TOU': PEA_3_2_3_medium_TOU,
  'PEA_4.1.1_large_TOD': PEA_4_1_1_large_TOD,
  'PEA_4.1.2_large_TOD': PEA_4_1_2_large_TOD,
  'PEA_4.1.3_large_TOD': PEA_4_1_3_large_TOD,
  'PEA_4.2.1_large_TOU': PEA_4_2_1_large_TOU,
  'PEA_4.2.2_large_TOU': PEA_4_2_2_large_TOU,
  'PEA_4.2.3_large_TOU': PEA_4_2_3_large_TOU,
  'PEA_5.1.1_specific_TOU': PEA_5_1_1_specific_TOU,
  'PEA_5.1.2_specific_TOU': PEA_5_1_2_specific_TOU,
  'PEA_5.1.3_specific_TOU': PEA_5_1_3_specific_TOU,
  'PEA_5.2.1_specific_TOU': PEA_5_2_1_specific_TOU,
  'PEA_5.2.2_specific_TOU': PEA_5_2_2_specific_TOU,
  'PEA_5.2.3_specific_TOU': PEA_5_2_3_specific_TOU,

  // MEA Strategies
  'MEA_2.2.1_small_TOU': MEA_2_2_1_small_TOU,
  'MEA_2.2.2_small_TOU': MEA_2_2_2_small_TOU,
  'MEA_3.1.1_medium_normal': MEA_3_1_1_medium_normal,
  'MEA_3.1.2_medium_normal': MEA_3_1_2_medium_normal,
  'MEA_3.1.3_medium_normal': MEA_3_1_3_medium_normal,
  'MEA_3.2.1_medium_TOU': MEA_3_2_1_medium_TOU,
  'MEA_3.2.2_medium_TOU': MEA_3_2_2_medium_TOU,
  'MEA_3.2.3_medium_TOU': MEA_3_2_3_medium_TOU,
  'MEA_4.1.1_large_TOD': MEA_4_1_1_large_TOD,
  'MEA_4.1.2_large_TOD': MEA_4_1_2_large_TOD,
  'MEA_4.1.3_large_TOD': MEA_4_1_3_large_TOD,
  'MEA_4.2.1_large_TOU': MEA_4_2_1_large_TOU,
  'MEA_4.2.2_large_TOU': MEA_4_2_2_large_TOU,
  'MEA_4.2.3_large_TOU': MEA_4_2_3_large_TOU,
  'MEA_5.1.1_specific_normal': MEA_5_1_1_specific_normal,
  'MEA_5.1.2_specific_normal': MEA_5_1_2_specific_normal,
  'MEA_5.1.3_specific_normal': MEA_5_1_3_specific_normal,
  'MEA_5.2.1_specific_TOU': MEA_5_2_1_specific_TOU,
  'MEA_5.2.2_specific_TOU': MEA_5_2_2_specific_TOU,
  'MEA_5.2.3_specific_TOU': MEA_5_2_3_specific_TOU
};

/**
 * Create and return a strategy instance based on parameters
 * @param {string} provider - Provider name (MEA or PEA)
 * @param {string} calculationType - Calculation type (type-2, type-3, type-4, type-5)
 * @param {string} tariffType - Tariff type (normal, tou, tod)
 * @param {string} voltageLevel - Voltage level
 * @returns {Object} - Strategy instance
 * @throws {Error} - If strategy not found or parameters invalid
 */
function createStrategy(provider, calculationType, tariffType, voltageLevel) {
  try {
    // Validate input parameters
    if (!provider || !calculationType || !tariffType || !voltageLevel) {
      throw new Error('All parameters (provider, calculationType, tariffType, voltageLevel) are required');
    }

    // Normalize provider name
    const normalizedProvider = provider.toUpperCase();
    if (!['MEA', 'PEA'].includes(normalizedProvider)) {
      throw new Error(`Invalid provider: ${provider}. Must be MEA or PEA`);
    }

    // Map calculation type to strategy identifier components
    const typeMapping = {
      'type-2': { baseType: '2.2', size: 'small' },
      'type-3': { baseType: '3', size: 'medium' },
      'type-4': { baseType: '4', size: 'large' },
      'type-5': { baseType: '5', size: 'specific' }
    };

    const typeInfo = typeMapping[calculationType];
    if (!typeInfo) {
      throw new Error(`Invalid calculation type: ${calculationType}. Must be type-2, type-3, type-4, or type-5`);
    }

    // Map voltage level to strategy identifier components
    const voltageMapping = {
      '<12kV': '3',
      '12-24kV': '2',
      '<22kV': '3',
      '22-33kV': '2',
      '>=69kV': '1'
    };

    const voltageSuffix = voltageMapping[voltageLevel];
    if (!voltageSuffix) {
      throw new Error(`Invalid voltage level: ${voltageLevel}`);
    }

    // Map tariff type to strategy identifier components
    const tariffMapping = {
      'normal': 'normal',
      'tou': 'TOU',
      'tod': 'TOD'
    };

    const tariffSuffix = tariffMapping[tariffType];
    if (!tariffSuffix) {
      throw new Error(`Invalid tariff type: ${tariffType}. Must be normal, tou, or tod`);
    }

    // Build strategy identifier
    let strategyId;
    if (calculationType === 'type-2') {
      // Type 2 has special handling for voltage levels
      const type2VoltageMapping = {
        '<12kV': '1',
        '12-24kV': '2',
        '<22kV': '1',
        '22-33kV': '2'
      };
      const type2VoltageSuffix = type2VoltageMapping[voltageLevel];
      strategyId = `${normalizedProvider}_2.2.${type2VoltageSuffix}_small_${tariffSuffix}`;
    } else {
      // Type 3, 4, 5 use the base type with voltage suffix
      // For TOU, use .2. prefix; for TOD and normal, use .1. prefix
      const tariffPrefix = (tariffSuffix === 'TOU') ? '2' : '1';
      strategyId = `${normalizedProvider}_${typeInfo.baseType}.${tariffPrefix}.${voltageSuffix}_${typeInfo.size}_${tariffSuffix}`;
    }

    // Get strategy class from registry
    const StrategyClass = STRATEGY_REGISTRY[strategyId];
    if (!StrategyClass) {
      throw new Error(`Strategy not found: ${strategyId}. Available strategies: ${Object.keys(STRATEGY_REGISTRY).join(', ')}`);
    }

    // Create and return strategy instance
    const strategy = new StrategyClass();
    
    logger.debug('Strategy created successfully', {
      strategyId,
      provider: normalizedProvider,
      calculationType,
      tariffType,
      voltageLevel,
      description: strategy.getDescription()
    });

    return strategy;

  } catch (error) {
    logger.error('Failed to create strategy', {
      provider,
      calculationType,
      tariffType,
      voltageLevel,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get all available strategies
 * @returns {Array} - Array of strategy identifiers
 */
function getAllStrategies() {
  return Object.keys(STRATEGY_REGISTRY);
}

/**
 * Get strategies by provider
 * @param {string} provider - Provider name (MEA or PEA)
 * @returns {Array} - Array of strategy identifiers for the provider
 */
function getStrategiesByProvider(provider) {
  const normalizedProvider = provider.toUpperCase();
  return Object.keys(STRATEGY_REGISTRY).filter(id => id.startsWith(normalizedProvider));
}

/**
 * Get strategies by calculation type
 * @param {string} calculationType - Calculation type (type-2, type-3, type-4, type-5)
 * @returns {Array} - Array of strategy identifiers for the calculation type
 */
function getStrategiesByCalculationType(calculationType) {
  const typeMapping = {
    'type-2': '2.2',
    'type-3': '3',
    'type-4': '4',
    'type-5': '5'
  };
  
  const baseType = typeMapping[calculationType];
  if (!baseType) {
    return [];
  }
  
  return Object.keys(STRATEGY_REGISTRY).filter(id => id.includes(`_${baseType}.`));
}

/**
 * Validate if a combination of parameters is supported
 * @param {string} provider - Provider name
 * @param {string} calculationType - Calculation type
 * @param {string} tariffType - Tariff type
 * @param {string} voltageLevel - Voltage level
 * @returns {boolean} - True if combination is supported
 */
function isCombinationSupported(provider, calculationType, tariffType, voltageLevel) {
  try {
    createStrategy(provider, calculationType, tariffType, voltageLevel);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  createStrategy,
  getAllStrategies,
  getStrategiesByProvider,
  getStrategiesByCalculationType,
  isCombinationSupported
};
