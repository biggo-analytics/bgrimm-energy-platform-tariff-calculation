/**
 * Electricity Service
 * Service that uses the strategy pattern for electricity bill calculations
 */

const { createStrategy } = require('../strategies/StrategyFactory');
const { logger } = require('../utils/logger');

class ElectricityService {
  constructor() {
    this.serviceName = 'Electricity Calculation Service';
    this.version = '3.0.0';
  }

  /**
   * Calculate electricity bill using strategy pattern
   * @param {string} provider - Provider name (MEA or PEA)
   * @param {string} calculationType - Calculation type (type-2, type-3, type-4, type-5)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculateBill(provider, calculationType, data) {
    try {
      // Validate input parameters
      this._validateInput(provider, calculationType, data);

      const { tariffType, voltageLevel } = data;

      // Create appropriate strategy using factory
      const strategy = createStrategy(provider, calculationType, tariffType, voltageLevel);

      // Execute calculation using strategy
      const result = strategy.calculate(data);

      // Log successful calculation
      logger.info('Calculation completed successfully', {
        provider,
        calculationType,
        tariffType,
        voltageLevel,
        strategyId: strategy.getStrategyId(),
        description: strategy.getDescription()
      });

      return result;

    } catch (error) {
      logger.error('Calculation failed', {
        provider,
        calculationType,
        tariffType: data?.tariffType,
        voltageLevel: data?.voltageLevel,
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
    return {
      serviceName: this.serviceName,
      version: this.version,
      description: 'Strategy pattern implementation for electricity bill calculations',
      providers: ['MEA', 'PEA'],
      calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5'],
      tariffTypes: ['normal', 'tou', 'tod'],
      features: {
        strategyPattern: true,
        unifiedStrategyLocation: true,
        sharedCalculationUtils: true,
        configurationDriven: true,
        maintainableCode: true
      }
    };
  }

  /**
   * Get available strategies for a provider
   * @param {string} provider - Provider name
   * @returns {Array} - Available strategies
   */
  getAvailableStrategies(provider) {
    const { getStrategiesByProvider } = require('../strategies/StrategyFactory');
    return getStrategiesByProvider(provider);
  }

  /**
   * Get available strategies for a calculation type
   * @param {string} calculationType - Calculation type
   * @returns {Array} - Available strategies
   */
  getStrategiesForCalculationType(calculationType) {
    const { getStrategiesByCalculationType } = require('../strategies/StrategyFactory');
    return getStrategiesByCalculationType(calculationType);
  }

  /**
   * Validate if a combination is supported
   * @param {string} provider - Provider name
   * @param {string} calculationType - Calculation type
   * @param {string} tariffType - Tariff type
   * @param {string} voltageLevel - Voltage level
   * @returns {boolean} - True if supported
   */
  isCombinationSupported(provider, calculationType, tariffType, voltageLevel) {
    const { isCombinationSupported } = require('../strategies/StrategyFactory');
    return isCombinationSupported(provider, calculationType, tariffType, voltageLevel);
  }

  /**
   * Validate input parameters
   * @param {string} provider - Provider name
   * @param {string} calculationType - Calculation type
   * @param {Object} data - Input data
   * @private
   */
  _validateInput(provider, calculationType, data) {
    if (!provider) {
      throw new Error('Provider is required');
    }

    if (!calculationType) {
      throw new Error('Calculation type is required');
    }

    if (!data) {
      throw new Error('Input data is required');
    }

    const { tariffType, voltageLevel } = data;

    if (!tariffType) {
      throw new Error('Tariff type is required');
    }

    if (!voltageLevel) {
      throw new Error('Voltage level is required');
    }

    // Validate provider
    const normalizedProvider = provider.toUpperCase();
    if (!['MEA', 'PEA'].includes(normalizedProvider)) {
      throw new Error(`Invalid provider: ${provider}. Must be MEA or PEA`);
    }

    // Validate calculation type
    const validCalculationTypes = ['type-2', 'type-3', 'type-4', 'type-5'];
    if (!validCalculationTypes.includes(calculationType)) {
      throw new Error(`Invalid calculation type: ${calculationType}. Valid types: ${validCalculationTypes.join(', ')}`);
    }

    // Validate tariff type
    const validTariffTypes = ['normal', 'tou', 'tod'];
    if (!validTariffTypes.includes(tariffType)) {
      throw new Error(`Invalid tariff type: ${tariffType}. Valid types: ${validTariffTypes.join(', ')}`);
    }

    // Validate voltage level based on provider
    const validVoltageLevels = this._getValidVoltageLevels(provider);
    if (!validVoltageLevels.includes(voltageLevel)) {
      throw new Error(`Invalid voltage level: ${voltageLevel}. Valid levels for ${provider}: ${validVoltageLevels.join(', ')}`);
    }
  }

  /**
   * Get valid voltage levels for a provider
   * @param {string} provider - Provider name
   * @returns {Array} - Valid voltage levels
   * @private
   */
  _getValidVoltageLevels(provider) {
    const normalizedProvider = provider.toUpperCase();
    
    if (normalizedProvider === 'MEA') {
      return ['<12kV', '12-24kV', '>=69kV'];
    } else if (normalizedProvider === 'PEA') {
      return ['<22kV', '22-33kV', '>=69kV'];
    }
    
    return [];
  }
}

// Create singleton instance
const electricityService = new ElectricityService();

module.exports = electricityService;
