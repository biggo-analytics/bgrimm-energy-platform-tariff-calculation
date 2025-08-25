/**
 * PEA Electricity Service with Strategy Pattern
 * Handles PEA electricity bill calculations using Strategy Pattern
 */

const BaseElectricityStrategyService = require('./base-electricity-strategy.service');
const { PEA_RATES } = require('../config/pea-rates');

class PEAElectricityStrategyService extends BaseElectricityStrategyService {
  constructor() {
    // PEA doesn't have a global service charge like MEA
    super(PEA_RATES, null);
  }

  /**
   * Calculate PEA electricity bill using Strategy Pattern
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculateBill(calculationType, data) {
    return super.calculateBill(calculationType, data);
  }

  /**
   * Get PEA-specific voltage levels
   * @returns {Array<string>} - Array of valid voltage levels for PEA
   */
  getValidVoltageLevels() {
    return ['<22kV', '22-33kV', '>=69kV'];
  }

  /**
   * Get PEA service information
   * @returns {Object} - PEA service information
   */
  getServiceInfo() {
    const baseInfo = super.getServiceInfo();
    return {
      ...baseInfo,
      provider: 'PEA',
      providerName: 'Provincial Electricity Authority',
      validVoltageLevels: this.getValidVoltageLevels(),
      serviceCharge: 'Variable by rate configuration'
    };
  }

  /**
   * Get PEA-specific rate information
   * @param {string} calculationType - Type of calculation
   * @param {string} tariffType - Type of tariff
   * @param {string} voltageLevel - Voltage level
   * @returns {Object} - Rate information with PEA-specific details
   */
  getRateInformation(calculationType, tariffType, voltageLevel) {
    try {
      const rates = this.getRateConfiguration(calculationType, tariffType, voltageLevel);
      return {
        provider: 'PEA',
        calculationType,
        tariffType,
        voltageLevel,
        rates,
        serviceCharge: rates.serviceCharge || 'Variable'
      };
    } catch (error) {
      throw new Error(`PEA rate lookup failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const peaElectricityStrategyService = new PEAElectricityStrategyService();

module.exports = peaElectricityStrategyService;
