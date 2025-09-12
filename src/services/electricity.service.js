/**
 * Electricity Service
 * Service that uses the strategy pattern for electricity bill calculations
 */

const { 
  createStrategy, 
  getAllStrategies, 
  getStrategiesByProvider, 
  getStrategiesByCalculationType,
  isTariffPlanSupported,
  getTariffPlanInfo
} = require('../strategies/StrategyFactory');
const { logger } = require('../utils/logger');

class ElectricityService {
  constructor() {
    this.serviceName = 'Electricity Calculation Service';
    this.version = '3.0.0';
  }

  /**
   * Calculate electricity bill using strategy pattern
   * @param {string} tariffPlanName - Tariff plan name (strategy file name)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculateBill(tariffPlanName, data) {
    try {
      // Validate input parameters
      this._validateInput(tariffPlanName, data);

      // Create appropriate strategy using factory
      const strategy = createStrategy(tariffPlanName);

      // Execute calculation using strategy
      const result = strategy.calculate(data);

      // Log successful calculation
      logger.info('Calculation completed successfully', {
        tariffPlanName,
        strategyId: strategy.getStrategyId ? strategy.getStrategyId() : tariffPlanName,
        description: strategy.getDescription ? strategy.getDescription() : 'No description'
      });

      return result;

    } catch (error) {
      logger.error('Calculation failed', {
        tariffPlanName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get service information
   * @returns {Object} - Service information
   */
  getServiceInfo() {
    const allTariffPlans = getAllStrategies();
    const meaPlans = getStrategiesByProvider('MEA');
    const peaPlans = getStrategiesByProvider('PEA');
    
    return {
      serviceName: this.serviceName,
      version: this.version,
      description: 'Dynamic strategy pattern implementation for electricity bill calculations',
      providers: ['MEA', 'PEA'],
      totalTariffPlans: allTariffPlans.length,
      meaTariffPlans: meaPlans.length,
      peaTariffPlans: peaPlans.length,
      features: {
        strategyPattern: true,
        dynamicLoading: true,
        fileSystemBased: true,
        sharedCalculationUtils: true,
        configurationDriven: true,
        maintainableCode: true,
        autoDiscovery: true
      }
    };
  }

  /**
   * Get available tariff plans for a provider
   * @param {string} provider - Provider name
   * @returns {Array} - Available tariff plans
   */
  getAvailableStrategies(provider) {
    return getStrategiesByProvider(provider);
  }

  /**
   * Get available tariff plans for a calculation type
   * @param {string} calculationType - Calculation type
   * @returns {Array} - Available tariff plans
   */
  getStrategiesForCalculationType(calculationType) {
    return getStrategiesByCalculationType(calculationType);
  }

  /**
   * Validate if a tariff plan is supported
   * @param {string} tariffPlanName - Tariff plan name
   * @returns {boolean} - True if supported
   */
  isTariffPlanSupported(tariffPlanName) {
    return isTariffPlanSupported(tariffPlanName);
  }

  /**
   * Get tariff plan information
   * @param {string} tariffPlanName - Tariff plan name
   * @returns {Object} - Tariff plan information
   */
  getTariffPlanInfo(tariffPlanName) {
    return getTariffPlanInfo(tariffPlanName);
  }

  /**
   * Get all available tariff plans
   * @returns {Array} - All available tariff plans
   */
  getAllTariffPlans() {
    return getAllStrategies();
  }

  /**
   * Validate input parameters
   * @param {string} tariffPlanName - Tariff plan name
   * @param {Object} data - Input data
   * @private
   */
  _validateInput(tariffPlanName, data) {
    if (!tariffPlanName) {
      throw new Error('Tariff plan name is required');
    }

    if (!data) {
      throw new Error('Input data is required');
    }

    // Validate tariff plan exists
    if (!isTariffPlanSupported(tariffPlanName)) {
      const availablePlans = getAllStrategies();
      throw new Error(`Tariff plan '${tariffPlanName}' is not supported. Available plans: ${availablePlans.join(', ')}`);
    }

    // Basic validation for required fields
    if (typeof data.ftRateSatang !== 'number') {
      throw new Error('ftRateSatang is required and must be a number');
    }

    if (!data.usage || typeof data.usage !== 'object') {
      throw new Error('usage data is required and must be an object');
    }
  }
}

// Create singleton instance
const electricityService = new ElectricityService();

module.exports = electricityService;
