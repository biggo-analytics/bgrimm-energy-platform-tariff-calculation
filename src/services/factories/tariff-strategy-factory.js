/**
 * Tariff Strategy Factory
 * Creates appropriate tariff strategy instances based on tariff type
 */

const NormalTariffStrategy = require('../strategies/normal-tariff-strategy');
const TOUTariffStrategy = require('../strategies/tou-tariff-strategy');
const TODTariffStrategy = require('../strategies/tod-tariff-strategy');

class TariffStrategyFactory {
  /**
   * Create a tariff strategy instance
   * @param {string} tariffType - Type of tariff (normal, tou, tod)
   * @param {Object} rates - Rate configuration object
   * @param {number} serviceCharge - Default service charge (optional)
   * @returns {BaseTariffStrategy} - Strategy instance
   */
  static createStrategy(tariffType, rates, serviceCharge = null) {
    if (!tariffType) {
      throw new Error('Tariff type is required');
    }

    if (!rates) {
      throw new Error('Rates configuration is required');
    }

    const normalizedTariffType = tariffType.toLowerCase();

    switch (normalizedTariffType) {
      case 'normal':
        return new NormalTariffStrategy(rates, serviceCharge);
      case 'tou':
        return new TOUTariffStrategy(rates, serviceCharge);
      case 'tod':
        return new TODTariffStrategy(rates, serviceCharge);
      default:
        throw new Error(`Unsupported tariff type: ${tariffType}. Supported types: normal, tou, tod`);
    }
  }

  /**
   * Get list of supported tariff types
   * @returns {Array<string>} - Array of supported tariff types
   */
  static getSupportedTariffTypes() {
    return ['normal', 'tou', 'tod'];
  }

  /**
   * Check if a tariff type is supported
   * @param {string} tariffType - Type of tariff to check
   * @returns {boolean} - True if supported
   */
  static isSupportedTariffType(tariffType) {
    return this.getSupportedTariffTypes().includes(tariffType.toLowerCase());
  }

  /**
   * Get supported tariff types for a specific calculation type
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @returns {Array<string>} - Array of supported tariff types for the calculation type
   */
  static getSupportedTariffTypesForCalculationType(calculationType) {
    const supportedTypes = {
      'type-2': ['normal', 'tou'],
      'type-3': ['normal', 'tou'],
      'type-4': ['tod', 'tou'],
      'type-5': ['normal', 'tou']
    };

    return supportedTypes[calculationType] || [];
  }

  /**
   * Validate if tariff type is supported for calculation type
   * @param {string} tariffType - Type of tariff
   * @param {string} calculationType - Type of calculation
   * @returns {boolean} - True if combination is valid
   */
  static isValidTariffTypeForCalculationType(tariffType, calculationType) {
    const supportedTypes = this.getSupportedTariffTypesForCalculationType(calculationType);
    return supportedTypes.includes(tariffType.toLowerCase());
  }

  /**
   * Create strategy with validation
   * @param {string} tariffType - Type of tariff
   * @param {string} calculationType - Type of calculation
   * @param {Object} rates - Rate configuration object
   * @param {number} serviceCharge - Default service charge (optional)
   * @returns {BaseTariffStrategy} - Strategy instance
   */
  static createValidatedStrategy(tariffType, calculationType, rates, serviceCharge = null) {
    if (!this.isValidTariffTypeForCalculationType(tariffType, calculationType)) {
      const supportedTypes = this.getSupportedTariffTypesForCalculationType(calculationType);
      throw new Error(
        `Tariff type '${tariffType}' is not supported for ${calculationType}. ` +
        `Supported types: ${supportedTypes.join(', ')}`
      );
    }

    return this.createStrategy(tariffType, rates, serviceCharge);
  }
}

module.exports = TariffStrategyFactory;
