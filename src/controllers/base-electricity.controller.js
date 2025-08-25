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
   * Generic calculation handler for all tariff calculation requests
   * 
   * This method provides centralized request handling including comprehensive validation,
   * calculation execution, and standardized response formatting. It ensures consistent
   * behavior across all calculation types and providers.
   * 
   * @param {Object} koaContext - Koa HTTP context containing request and response
   * @param {Array<string>} mandatoryFieldNames - List of required field names for validation
   * @param {string} customerCalculationType - Type of calculation (type-2, type-3, type-4, type-5)
   * @returns {Promise<void>} - Async function that sets response on context
   */
  handleCalculation(koaContext, mandatoryFieldNames, customerCalculationType) {
    return asyncErrorHandler(async () => {
      const { body: requestBody } = koaContext.request;
      
      // Validate request body exists and is not empty
      this._validateRequestBodyExists(requestBody);
      
      // Validate all mandatory fields are provided
      this._validateMandatoryFields(requestBody, mandatoryFieldNames);

      // Validate tariff type
      if (!validateTariffType(requestBody.tariffType)) {
        throw new ValidationError(
          getTariffTypeErrorMessage(customerCalculationType, requestBody.tariffType),
          'tariffType'
        );
      }

      // Validate voltage level
      if (!validateVoltageLevel(requestBody.voltageLevel, this.provider)) {
        throw new ValidationError(
          getVoltageLevelErrorMessage(customerCalculationType, requestBody.tariffType || 'unknown', requestBody.voltageLevel, this.provider),
          'voltageLevel'
        );
      }

      // Validate numeric fields that must be positive numbers
      const numericFieldsToValidate = [
        { 
          fieldValue: requestBody.ftRateSatang, 
          fieldName: 'ftRateSatang',
          description: 'Fuel Adjustment Rate'
        },
        { 
          fieldValue: requestBody.peakKvar, 
          fieldName: 'peakKvar',
          description: 'Peak Reactive Power'
        },
        { 
          fieldValue: requestBody.highestDemandChargeLast12m, 
          fieldName: 'highestDemandChargeLast12m',
          description: 'Historical Peak Demand Charge'
        }
      ];

      // Validate each numeric field if provided
      for (const { fieldValue, fieldName, description } of numericFieldsToValidate) {
        if (this._isFieldProvided(fieldValue)) {
          const numericValidationResult = validateNumericValue(fieldValue, fieldName);
          if (!numericValidationResult.isValid) {
            throw new ValidationError(
              `${description} (${fieldName}): ${numericValidationResult.error}`, 
              fieldName
            );
          }
        }
      }

      // Validate usage fields
      const usageValidation = validateUsageFields(requestBody.usage, requestBody.tariffType, customerCalculationType);
      if (!usageValidation.isValid) {
        throw new ValidationError(usageValidation.error, 'usage');
      }

      // Log calculation request
      logger.logCalculation(this.provider, customerCalculationType, requestBody);
      
      try {
        // Execute the billing calculation using the appropriate service
        const calculationResult = this.electricityService.calculateBill(
          customerCalculationType, 
          requestBody
        );
        
        // Set successful response with standardized format
        koaContext.status = 200;
        koaContext.body = this._formatSuccessfulCalculationResponse(
          calculationResult,
          customerCalculationType
        );
        
      } catch (calculationError) {
        // Log calculation failure with context for debugging
        logger.error('Billing calculation failed', {
          provider: this.provider,
          calculationType: customerCalculationType,
          errorMessage: calculationError.message,
          inputData: requestBody,
          timestamp: new Date().toISOString()
        });
        
        // Throw user-friendly error
        throw new CalculationError(
          `Failed to calculate ${customerCalculationType} bill: ${calculationError.message}`
        );
      }
    })(koaContext);
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
  
  /**
   * Validate that request body exists and is not empty
   * @private
   * @param {*} requestBody - Request body to validate
   * @throws {ValidationError} - If body is missing or empty
   */
  _validateRequestBodyExists(requestBody) {
    if (!requestBody || (typeof requestBody === 'object' && Object.keys(requestBody).length === 0)) {
      throw new ValidationError('Request body is required and cannot be empty');
    }
  }
  
  /**
   * Validate that all mandatory fields are provided in request
   * @private
   * @param {Object} requestBody - Request body containing fields
   * @param {Array<string>} mandatoryFieldNames - List of required field names
   * @throws {ValidationError} - If any mandatory field is missing
   */
  _validateMandatoryFields(requestBody, mandatoryFieldNames) {
    for (const requiredFieldName of mandatoryFieldNames) {
      const fieldValue = requestBody[requiredFieldName];
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        throw new ValidationError(
          `Missing required field: ${requiredFieldName}. This field is mandatory for the calculation.`,
          requiredFieldName
        );
      }
    }
  }
  
  /**
   * Check if a field value is provided (not undefined or null)
   * @private
   * @param {*} fieldValue - Value to check
   * @returns {boolean} - True if field is provided
   */
  _isFieldProvided(fieldValue) {
    return fieldValue !== undefined && fieldValue !== null;
  }
  
  /**
   * Format successful calculation response with standard structure
   * @private
   * @param {Object} calculationResult - Result from calculation service
   * @param {string} calculationType - Type of calculation performed
   * @returns {Object} - Formatted response object
   */
  _formatSuccessfulCalculationResponse(calculationResult, calculationType) {
    return {
      ...calculationResult,
      success: true,
      timestamp: new Date().toISOString(),
      provider: this.provider,
      calculationType,
      metadata: {
        version: '2.0.0',
        processingTime: new Date().toISOString()
      }
    };
  }
}

module.exports = BaseElectricityController;
