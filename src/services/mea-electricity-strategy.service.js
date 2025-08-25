/**
 * MEA Electricity Service with Strategy Pattern
 * Handles MEA electricity bill calculations using Strategy Pattern
 */

const BaseElectricityStrategyService = require('./base-electricity-strategy.service');
const { MEA_RATES, MEA_SERVICE_CHARGE } = require('../config/mea-rates');

class MEAElectricityStrategyService extends BaseElectricityStrategyService {
  constructor() {
    super(MEA_RATES, MEA_SERVICE_CHARGE);
  }

  /**
   * Calculate MEA electricity bill using Strategy Pattern
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculateBill(calculationType, data) {
    return super.calculateBill(calculationType, data);
  }

  /**
   * Get MEA-specific voltage levels
   * @returns {Array<string>} - Array of valid voltage levels for MEA
   */
  getValidVoltageLevels() {
    return ['<12kV', '12-24kV', '>=69kV'];
  }

  /**
   * Get MEA service information
   * @returns {Object} - MEA service information
   */
  getServiceInfo() {
    const baseInfo = super.getServiceInfo();
    return {
      ...baseInfo,
      provider: 'MEA',
      providerName: 'Metropolitan Electricity Authority',
      validVoltageLevels: this.getValidVoltageLevels(),
      serviceCharge: MEA_SERVICE_CHARGE
    };
  }

  /**
   * Get MEA-specific rate information
   * @param {string} calculationType - Type of calculation
   * @param {string} tariffType - Type of tariff
   * @param {string} voltageLevel - Voltage level
   * @returns {Object} - Rate information with MEA-specific details
   */
  getRateInformation(calculationType, tariffType, voltageLevel) {
    try {
      const rates = this.getRateConfiguration(calculationType, tariffType, voltageLevel);
      return {
        provider: 'MEA',
        calculationType,
        tariffType,
        voltageLevel,
        rates,
        serviceCharge: rates.serviceCharge || MEA_SERVICE_CHARGE
      };
    } catch (error) {
      throw new Error(`MEA rate lookup failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const meaElectricityStrategyService = new MEAElectricityStrategyService();

module.exports = meaElectricityStrategyService;
