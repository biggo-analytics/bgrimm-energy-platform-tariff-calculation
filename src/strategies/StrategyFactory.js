/**
 * Strategy Factory
 * Factory function to dynamically load and instantiate strategy classes
 * based on tariff plan names from file system
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

// Cache for loaded strategies
const strategyCache = new Map();

/**
 * Get all strategy file names from the strategies directory
 * @returns {Array} - Array of strategy file names (without .js extension)
 */
function getAvailableStrategyFiles() {
  try {
    const strategiesDir = __dirname;
    const files = fs.readdirSync(strategiesDir);
    
    // Filter only .js files that are not the factory or interface files
    const strategyFiles = files
      .filter(file => {
        return file.endsWith('.js') && 
               file !== 'StrategyFactory.js' && 
               file !== 'ICalculationStrategy.js' &&
               file !== 'shared-calculation-utils.js';
      })
      .map(file => file.replace('.js', '')); // Remove .js extension
    
    logger.debug('Found strategy files', { 
      count: strategyFiles.length, 
      files: strategyFiles 
    });
    
    return strategyFiles;
  } catch (error) {
    logger.error('Failed to read strategy files', { error: error.message });
    throw new Error(`Failed to read strategy files: ${error.message}`);
  }
}

/**
 * Dynamically load a strategy class by file name
 * @param {string} strategyFileName - Name of the strategy file (without .js)
 * @returns {Object} - Strategy class
 */
function loadStrategyClass(strategyFileName) {
  try {
    // Check cache first
    if (strategyCache.has(strategyFileName)) {
      return strategyCache.get(strategyFileName);
    }

    // Load strategy dynamically
    const strategyPath = path.join(__dirname, `${strategyFileName}.js`);
    
    // Check if file exists
    if (!fs.existsSync(strategyPath)) {
      throw new Error(`Strategy file not found: ${strategyFileName}.js`);
    }

    // Load the strategy class
    const StrategyClass = require(strategyPath);
    
    // Cache the loaded class
    strategyCache.set(strategyFileName, StrategyClass);
    
    logger.debug('Strategy class loaded', { 
      strategyFileName, 
      hasCalculate: typeof StrategyClass.prototype.calculate === 'function' 
    });
    
    return StrategyClass;
  } catch (error) {
    logger.error('Failed to load strategy class', { 
      strategyFileName, 
      error: error.message 
    });
    throw new Error(`Failed to load strategy ${strategyFileName}: ${error.message}`);
  }
}

/**
 * Create and return a strategy instance based on tariff plan name
 * @param {string} tariffPlanName - Tariff plan name (strategy file name without .js)
 * @returns {Object} - Strategy instance
 * @throws {Error} - If strategy not found or invalid
 */
function createStrategy(tariffPlanName) {
  try {
    // Validate input parameter
    if (!tariffPlanName) {
      throw new Error('Tariff plan name is required');
    }

    // Get available strategy files to validate
    const availableStrategies = getAvailableStrategyFiles();
    
    if (!availableStrategies.includes(tariffPlanName)) {
      throw new Error(`Tariff plan '${tariffPlanName}' not found. Available plans: ${availableStrategies.join(', ')}`);
    }

    // Load strategy class dynamically
    const StrategyClass = loadStrategyClass(tariffPlanName);

    // Create and return strategy instance
    const strategy = new StrategyClass();
    
    logger.debug('Strategy created successfully', {
      tariffPlanName,
      description: strategy.getDescription ? strategy.getDescription() : 'No description available'
    });

    return strategy;

  } catch (error) {
    logger.error('Failed to create strategy', {
      tariffPlanName,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get all available tariff plans
 * @returns {Array} - Array of tariff plan names
 */
function getAllStrategies() {
  return getAvailableStrategyFiles();
}

/**
 * Get tariff plans by provider
 * @param {string} provider - Provider name (MEA or PEA)
 * @returns {Array} - Array of tariff plan names for the provider
 */
function getStrategiesByProvider(provider) {
  const normalizedProvider = provider.toUpperCase();
  const allStrategies = getAvailableStrategyFiles();
  return allStrategies.filter(strategy => strategy.startsWith(normalizedProvider));
}

/**
 * Get tariff plans by calculation type
 * @param {string} calculationType - Calculation type (type-2, type-3, type-4, type-5)
 * @returns {Array} - Array of tariff plan names for the calculation type
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
  
  const allStrategies = getAvailableStrategyFiles();
  return allStrategies.filter(strategy => strategy.includes(`_${baseType}.`));
}

/**
 * Validate if a tariff plan is supported
 * @param {string} tariffPlanName - Tariff plan name
 * @returns {boolean} - True if tariff plan is supported
 */
function isTariffPlanSupported(tariffPlanName) {
  try {
    createStrategy(tariffPlanName);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get tariff plan information
 * @param {string} tariffPlanName - Tariff plan name
 * @returns {Object} - Tariff plan information
 */
function getTariffPlanInfo(tariffPlanName) {
  try {
    const strategy = createStrategy(tariffPlanName);
    return {
      name: tariffPlanName,
      description: strategy.getDescription ? strategy.getDescription() : 'No description available',
      supported: true
    };
  } catch (error) {
    return {
      name: tariffPlanName,
      description: 'Not found',
      supported: false,
      error: error.message
    };
  }
}

module.exports = {
  createStrategy,
  getAllStrategies,
  getStrategiesByProvider,
  getStrategiesByCalculationType,
  isTariffPlanSupported,
  getTariffPlanInfo,
  getAvailableStrategyFiles
};
