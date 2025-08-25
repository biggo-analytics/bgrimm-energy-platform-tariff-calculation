/**
 * Base Electricity Controller
 * Abstract base class for electricity calculation controllers
 */

const { 
  validateCalculationInput, 
  validateVoltageLevel, 
  validateTariffType,
  validateNumericValue,
  validateUsageFields,
  getTariffTypeErrorMessage,
  getVoltageLevelErrorMessage
} = require('../utils/validation');
const { ValidationError, CalculationError, asyncErrorHandler } = require('../utils/error-handler');
const { logger } = require('../utils/logger');

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
  handleCalculation(ctx, requiredFields, calculationType) {
    return asyncErrorHandler(async () => {
      const { body } = ctx.request;
      
      // Validate required fields manually to throw proper ValidationError
      if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
        throw new ValidationError('Request body is required');
      }

      for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
          throw new ValidationError(`Missing required field: ${field}`, field);
        }
      }

      // Validate tariff type
      if (!validateTariffType(body.tariffType)) {
        throw new ValidationError(
          getTariffTypeErrorMessage(calculationType, body.tariffType),
          'tariffType'
        );
      }

      // Validate voltage level
      if (!validateVoltageLevel(body.voltageLevel, this.provider)) {
        throw new ValidationError(
          getVoltageLevelErrorMessage(calculationType, body.tariffType || 'unknown', body.voltageLevel, this.provider),
          'voltageLevel'
        );
      }

      // Validate numeric fields
      const numericFields = [
        { field: body.ftRateSatang, name: 'ftRateSatang' },
        { field: body.peakKvar, name: 'peakKvar' },
        { field: body.highestDemandChargeLast12m, name: 'highestDemandChargeLast12m' }
      ];

      for (const { field, name } of numericFields) {
        if (field !== undefined && field !== null) {
          const validation = validateNumericValue(field, name);
          if (!validation.isValid) {
            throw new ValidationError(validation.error, name);
          }
        }
      }

      // Validate usage fields
      const usageValidation = validateUsageFields(body.usage, body.tariffType, calculationType);
      if (!usageValidation.isValid) {
        throw new ValidationError(usageValidation.error, 'usage');
      }

      // Log calculation request
      logger.logCalculation(this.provider, calculationType, body);
      
      try {
        const result = this.electricityService.calculateBill(calculationType, body);
        
        ctx.status = 200;
        ctx.body = {
          ...result,
          success: true,
          timestamp: new Date().toISOString(),
          provider: this.provider,
          calculationType
        };
      } catch (error) {
        logger.error('Calculation failed', {
          provider: this.provider,
          calculationType,
          error: error.message,
          input: body
        });
        throw new CalculationError(`Failed to calculate ${calculationType}: ${error.message}`);
      }
    })(ctx);
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

  // Type 2 calculation methods
  calculateType2(ctx) {
    const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'usage'];
    return this.handleCalculation(ctx, requiredFields, 'type-2');
  }

  // Type 3 calculation methods
  calculateType3(ctx) {
    const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
    return this.handleCalculation(ctx, requiredFields, 'type-3');
  }

  calculateType4(ctx) {
    const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
    return this.handleCalculation(ctx, requiredFields, 'type-4');
  }

  calculateType5(ctx) {
    const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
    return this.handleCalculation(ctx, requiredFields, 'type-5');
  }
}

module.exports = BaseElectricityController;
