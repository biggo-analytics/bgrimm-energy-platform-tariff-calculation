/**
 * Base Electricity Controller
 * Abstract base class for electricity calculation controllers
 */

const { 
  validateCalculationInput, 
  validateVoltageLevel, 
  validateTariffType,
  getTariffTypeErrorMessage,
  getVoltageLevelErrorMessage
} = require('../utils/validation');

class BaseElectricityController {
  constructor(electricityService, provider) {
    this.electricityService = electricityService;
    this.provider = provider;
  }

  /**
   * Generic calculation handler
   * @param {Object} ctx - Koa context
   * @param {Array} requiredFields - Required fields for validation
   * @param {string} calculationType - Type of calculation
   * @returns {Promise<void>}
   */
  async handleCalculation(ctx, requiredFields, calculationType) {
    if (!validateCalculationInput(ctx, requiredFields)) {
      return;
    }

    const { body } = ctx.request;
    
    // Validate voltage level
    if (!validateVoltageLevel(body.voltageLevel, this.provider)) {
      ctx.status = 400;
      ctx.body = { 
        error: getVoltageLevelErrorMessage(calculationType, body.tariffType || 'unknown', body.voltageLevel)
      };
      return;
    }

    // Validate tariff type
    if (!validateTariffType(body.tariffType, calculationType)) {
      ctx.status = 400;
      ctx.body = { 
        error: getTariffTypeErrorMessage(calculationType, body.tariffType)
      };
      return;
    }

    try {
      const result = this.electricityService.calculateBill(calculationType, body);
      ctx.body = result;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: error.message };
    }
  }

  /**
   * Get valid voltage levels for this provider
   * @returns {Array} - Array of valid voltage levels
   */
  getValidVoltageLevels() {
    const validLevels = {
      mea: ['<12kV', '12-24kV', '>=69kV'],
      pea: ['<22kV', '22-33kV', '>=69kV']
    };
    return validLevels[this.provider] || [];
  }

  /**
   * Get valid tariff types for calculation type
   * @param {string} calculationType - Calculation type
   * @returns {Array} - Array of valid tariff types
   */
  getValidTariffTypes(calculationType) {
    const validTypes = {
      'type-2': ['normal', 'tou'],
      'type-3': ['normal', 'tou'],
      'type-4': ['tod', 'tou'],
      'type-5': ['normal', 'tou']
    };
    return validTypes[calculationType] || [];
  }

  /**
   * Calculate Type 2
   * @param {Object} ctx - Koa context
   */
  async calculateType2(ctx) {
    const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'usage'];
    await this.handleCalculation(ctx, requiredFields, 'type-2');
  }

  /**
   * Calculate Type 3
   * @param {Object} ctx - Koa context
   */
  async calculateType3(ctx) {
    const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
    await this.handleCalculation(ctx, requiredFields, 'type-3');
  }

  /**
   * Calculate Type 4
   * @param {Object} ctx - Koa context
   */
  async calculateType4(ctx) {
    const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
    await this.handleCalculation(ctx, requiredFields, 'type-4');
  }

  /**
   * Calculate Type 5
   * @param {Object} ctx - Koa context
   */
  async calculateType5(ctx) {
    const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
    await this.handleCalculation(ctx, requiredFields, 'type-5');
  }
}

module.exports = BaseElectricityController;
