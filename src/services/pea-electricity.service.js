/**
 * PEA Electricity Service
 * Handles PEA electricity bill calculations
 */

const BaseElectricityService = require('./base-electricity.service');
const { PEA_RATES } = require('../config/pea-rates');

class PEAElectricityService extends BaseElectricityService {
  constructor() {
    super(PEA_RATES);
  }

  /**
   * Calculate PEA electricity bill
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculateBill(calculationType, data) {
    return super.calculateBill(calculationType, data);
  }
}

// Create singleton instance
const peaElectricityService = new PEAElectricityService();

module.exports = peaElectricityService;
