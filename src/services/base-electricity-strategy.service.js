/**
 * Base Electricity Service with Strategy Pattern
 * Refactored base class using Strategy Pattern for tariff calculations
 */

const TariffStrategyFactory = require('./factories/tariff-strategy-factory');
const { logger } = require('../utils/logger');

class BaseElectricityStrategyService {
  constructor(rates, serviceCharge = null) {
    this.rates = rates;
    this.serviceCharge = serviceCharge;
  }

  /**
   * Main calculation dispatcher using Strategy Pattern
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculateBill(calculationType, data) {
    try {
      // Validate input data
      this._validateCalculationInput(calculationType, data);

      // Extract tariff type from data
      const { tariffType } = data;

      // Create appropriate strategy using factory
      const strategy = TariffStrategyFactory.createValidatedStrategy(
        tariffType, 
        calculationType, 
        this.rates, 
        this.serviceCharge
      );

      // Execute calculation using strategy
      const result = strategy.calculate(calculationType, data);

      // Log successful calculation
      logger.debug('Calculation completed successfully', {
        calculationType,
        tariffType,
        voltageLevel: data.voltageLevel
      });

      return result;

    } catch (error) {
      logger.error('Calculation failed', {
        calculationType,
        tariffType: data.tariffType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get available tariff types for a calculation type
   * @param {string} calculationType - Type of calculation
   * @returns {Array<string>} - Available tariff types
   */
  getAvailableTariffTypes(calculationType) {
    return TariffStrategyFactory.getSupportedTariffTypesForCalculationType(calculationType);
  }

  /**
   * Check if tariff type is supported for calculation type
   * @param {string} tariffType - Type of tariff
   * @param {string} calculationType - Type of calculation
   * @returns {boolean} - True if supported
   */
  isValidTariffType(tariffType, calculationType) {
    return TariffStrategyFactory.isValidTariffTypeForCalculationType(tariffType, calculationType);
  }

  /**
   * Get rate configuration for specific calculation and tariff type
   * @param {string} calculationType - Type of calculation
   * @param {string} tariffType - Type of tariff
   * @param {string} voltageLevel - Voltage level
   * @returns {Object} - Rate configuration
   */
  getRateConfiguration(calculationType, tariffType, voltageLevel) {
    const typeKey = calculationType.toUpperCase().replace('-', '_');
    
    if (!this.rates[typeKey]) {
      throw new Error(`No rates found for calculation type: ${calculationType}`);
    }

    if (!this.rates[typeKey][tariffType]) {
      throw new Error(`No rates found for tariff type: ${tariffType} in ${calculationType}`);
    }

    if (!this.rates[typeKey][tariffType][voltageLevel]) {
      throw new Error(`No rates found for voltage level: ${voltageLevel} in ${calculationType}/${tariffType}`);
    }

    return this.rates[typeKey][tariffType][voltageLevel];
  }

  /**
   * Validate calculation input
   * @param {string} calculationType - Type of calculation
   * @param {Object} data - Input data
   * @private
   */
  _validateCalculationInput(calculationType, data) {
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

    // Validate calculation type
    const validCalculationTypes = ['type-2', 'type-3', 'type-4', 'type-5'];
    if (!validCalculationTypes.includes(calculationType)) {
      throw new Error(`Invalid calculation type: ${calculationType}. Valid types: ${validCalculationTypes.join(', ')}`);
    }

    // Validate tariff type for calculation type
    if (!this.isValidTariffType(tariffType, calculationType)) {
      const availableTypes = this.getAvailableTariffTypes(calculationType);
      throw new Error(
        `Tariff type '${tariffType}' is not valid for ${calculationType}. ` +
        `Available types: ${availableTypes.join(', ')}`
      );
    }
  }

  /**
   * Get service information
   * @returns {Object} - Service information
   */
  getServiceInfo() {
    return {
      supportedCalculationTypes: ['type-2', 'type-3', 'type-4', 'type-5'],
      supportedTariffTypes: TariffStrategyFactory.getSupportedTariffTypes(),
      tariffTypesPerCalculationType: {
        'type-2': this.getAvailableTariffTypes('type-2'),
        'type-3': this.getAvailableTariffTypes('type-3'),
        'type-4': this.getAvailableTariffTypes('type-4'),
        'type-5': this.getAvailableTariffTypes('type-5')
      }
    };
  }
}

module.exports = BaseElectricityStrategyService;
