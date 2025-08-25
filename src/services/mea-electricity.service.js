/**
 * MEA Electricity Service
 * Handles MEA electricity bill calculations
 */

const BaseElectricityService = require('./base-electricity.service');
const { MEA_RATES, MEA_SERVICE_CHARGE } = require('../config/mea-rates');

class MEAElectricityService extends BaseElectricityService {
  constructor() {
    super(MEA_RATES, MEA_SERVICE_CHARGE);
  }

  /**
   * Calculate MEA electricity bill
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculateBill(calculationType, data) {
    return super.calculateBill(calculationType, data);
  }
}

// Create singleton instance
const meaElectricityService = new MEAElectricityService();

module.exports = meaElectricityService;
