/**
 * Strategy Selector
 * Central module for dynamically loading electricity rate calculation strategies
 */

const path = require('path');

/**
 * Dynamically loads and returns a strategy module based on the strategy name
 * @param {string} strategyName - The strategy name (e.g., 'MEA_3.1.3_medium_normal', 'PEA_4.2.1_large_TOU')
 * @returns {object} The strategy module containing config and calculate function
 * @throws {Error} If strategy name is invalid or strategy file doesn't exist
 */
function getStrategy(strategyName) {
  if (!strategyName || typeof strategyName !== 'string') {
    throw new Error('Strategy name must be a non-empty string');
  }

  // Validate strategy name format
  const strategyNameRegex = /^(MEA|PEA)_\d+\.\d+\.\d+_\w+$/;
  if (!strategyNameRegex.test(strategyName)) {
    throw new Error(`Invalid strategy name format: ${strategyName}. Expected format: MEA_X.X.X_name or PEA_X.X.X_name`);
  }

  // Extract authority (MEA or PEA) from strategy name
  const authority = strategyName.split('_')[0].toLowerCase();
  
  if (authority !== 'mea' && authority !== 'pea') {
    throw new Error(`Invalid authority in strategy name: ${strategyName}. Must start with MEA or PEA`);
  }

  try {
    // Construct the path to the strategy file
    const strategyPath = path.join(__dirname, 'strategies', authority, `${strategyName}.js`);
    
    // Dynamically require the strategy module
    const strategy = require(strategyPath);
    
    // Validate that the strategy has required properties
    if (!strategy || typeof strategy !== 'object') {
      throw new Error(`Invalid strategy module: ${strategyName}`);
    }
    
    if (!strategy.calculate || typeof strategy.calculate !== 'function') {
      throw new Error(`Strategy ${strategyName} missing required 'calculate' function`);
    }
    
    return strategy;
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(`Strategy not found: ${strategyName}. Please check the strategy name and ensure the file exists.`);
    }
    throw error;
  }
}

/**
 * Gets a list of all available strategy names
 * @returns {object} Object containing arrays of available MEA and PEA strategies
 */
function getAvailableStrategies() {
  const meaStrategies = [
    'MEA_2.2.1_small_TOU',
    'MEA_2.2.2_small_TOU',
    'MEA_3.1.1_medium_normal',
    'MEA_3.1.2_medium_normal',
    'MEA_3.1.3_medium_normal',
    'MEA_3.2.1_medium_TOU',
    'MEA_3.2.2_medium_TOU',
    'MEA_3.2.3_medium_TOU',
    'MEA_4.1.1_large_TOD',
    'MEA_4.1.2_large_TOD',
    'MEA_4.1.3_large_TOD',
    'MEA_4.2.1_large_TOU',
    'MEA_4.2.2_large_TOU',
    'MEA_4.2.3_large_TOU',
    'MEA_5.1.1_specific_normal',
    'MEA_5.1.2_specific_normal',
    'MEA_5.1.3_specific_normal',
    'MEA_5.2.1_specific_TOU',
    'MEA_5.2.2_specific_TOU',
    'MEA_5.2.3_specific_TOU'
  ];

  const peaStrategies = [
    'PEA_2.2.1_small_TOU',
    'PEA_2.2.2_small_TOU',
    'PEA_3.1.1_medium_normal',
    'PEA_3.1.2_medium_normal',
    'PEA_3.1.3_medium_normal',
    'PEA_3.2.1_medium_TOU',
    'PEA_3.2.2_medium_TOU',
    'PEA_3.2.3_medium_TOU',
    'PEA_4.1.1_large_TOD',
    'PEA_4.1.2_large_TOD',
    'PEA_4.1.3_large_TOD',
    'PEA_4.2.1_large_TOU',
    'PEA_4.2.2_large_TOU',
    'PEA_4.2.3_large_TOU',
    'PEA_5.1.1_specific_TOU',
    'PEA_5.1.2_specific_TOU',
    'PEA_5.1.3_specific_TOU',
    'PEA_5.2.1_specific_TOU',
    'PEA_5.2.2_specific_TOU',
    'PEA_5.2.3_specific_TOU'
  ];

  return {
    mea: meaStrategies,
    pea: peaStrategies,
    all: [...meaStrategies, ...peaStrategies]
  };
}

/**
 * Validates if a strategy name exists
 * @param {string} strategyName - The strategy name to validate
 * @returns {boolean} True if strategy exists, false otherwise
 */
function isValidStrategy(strategyName) {
  const availableStrategies = getAvailableStrategies();
  return availableStrategies.all.includes(strategyName);
}

module.exports = {
  getStrategy,
  getAvailableStrategies,
  isValidStrategy
};
