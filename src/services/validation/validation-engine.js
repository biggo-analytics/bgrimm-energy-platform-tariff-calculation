/**
 * Simple Validation Engine for Electricity Bill Calculations
 * Provides detailed validation with field-specific error messages
 */

class ValidationEngine {
  constructor() {
    this.errors = [];
  }

  /**
   * Validate required fields
   */
  validateRequired(params, requiredFields) {
    requiredFields.forEach(field => {
      if (!params[field] && params[field] !== 0) {
        this.errors.push({
          field,
          message: `${field} is required`
        });
      }
    });
  }

  /**
   * Validate tariff type compatibility
   */
  validateTariffType(calculationType, tariffType, voltageLevel) {
    if (calculationType === 'type-2') {
      if (tariffType !== 'tou') {
        this.errors.push({
          field: 'tariffType',
          message: 'Type 2 only supports TOU tariff'
        });
      }
    } else if (calculationType === 'type-5') {
      // Type-5 validation is handled in the detailed business logic validation below
      // No early rejection here
    }
  }

  /**
   * Validate voltage level
   */
  validateVoltageLevel(voltageLevel, supportedLevels) {
    if (!supportedLevels.includes(voltageLevel)) {
      this.errors.push({
        field: 'voltageLevel',
        message: `Invalid voltage level: ${voltageLevel}. Supported: ${supportedLevels.join(', ')}`
      });
    }
  }

  /**
   * Validate numeric values
   */
  validateNumericValues(params, fields) {
    fields.forEach(field => {
      if (params[field] !== undefined) {
        if (typeof params[field] !== 'number' && isNaN(Number(params[field]))) {
          this.errors.push({
            field,
            message: `${field} must be a valid number`
          });
        } else if (Number(params[field]) < 0) {
          this.errors.push({
            field,
            message: `${field} must be positive`
          });
        }
      }
    });
  }

  /**
   * Validate business logic for specific calculation types
   */
  validateBusinessLogic(calculationType, tariffType, params) {
    if (calculationType === 'type-2') {
      // Type-2 requires both onPeakKwh and offPeakKwh for TOU
      if (tariffType === 'tou') {
        if (params.onPeakKwh === undefined || params.offPeakKwh === undefined) {
          this.errors.push({
            field: 'offPeakKwh',
            message: 'Both onPeakKwh and offPeakKwh are required for TOU tariff'
          });
        }
        // Type-2 should not have demand field
        if (params.demand !== undefined) {
          this.errors.push({
            field: 'demand',
            message: 'Demand field is not allowed for Type 2'
          });
        }
        // Type-2 should not have kwh field
        if (params.kwh !== undefined) {
          this.errors.push({
            field: 'kwh',
            message: 'kwh field is not allowed for Type 2 TOU'
          });
        }
      }
    } else if (calculationType === 'type-3') {
      // Type-3 requires demand field
      if (params.demand === undefined) {
        this.errors.push({
          field: 'demand',
          message: `Demand field is required for ${tariffType} tariff`
        });
      }
      // Type-3 should not have peakKwh field (not TOD)
      if (params.peakKwh !== undefined) {
        this.errors.push({
          field: 'peakKwh',
          message: 'peakKwh field is not allowed for Type 3'
        });
      }
    } else if (calculationType === 'type-4') {
      // Type-4 requires different fields based on tariff type
      if (tariffType === 'tod') {
        // TOD tariff uses onPeakDemand, partialPeakDemand, offPeakDemand
        if (params.onPeakDemand === undefined || params.partialPeakDemand === undefined || params.offPeakDemand === undefined) {
          this.errors.push({
            field: 'demand',
            message: 'onPeakDemand, partialPeakDemand, and offPeakDemand are required for TOD tariff'
          });
        }
        // TOD tariff also needs kwh for energy charges
        if (params.kwh === undefined) {
          this.errors.push({
            field: 'kwh',
            message: 'kwh field is required for TOD tariff'
          });
        }
      } else if (tariffType === 'tou') {
        // TOU tariff uses single demand field
        if (params.demand === undefined) {
          this.errors.push({
            field: 'demand',
            message: 'Demand field is required for TOU tariff'
          });
        }
        // TOU tariff should not have kwh field
        if (params.kwh !== undefined) {
          this.errors.push({
            field: 'kwh',
            message: 'kwh field is not allowed for Type 4 TOU'
          });
        }
      }
    } else if (calculationType === 'type-5') {
      // Type-5 supports both normal and TOU tariffs
      if (tariffType === 'normal') {
        // Normal tariff requires kwh and demand fields
        if (params.kwh === undefined) {
          this.errors.push({
            field: 'kwh',
            message: 'kwh field is required for normal tariff'
          });
        }
        if (params.demand === undefined) {
          this.errors.push({
            field: 'demand',
            message: 'demand field is required for normal tariff'
          });
        }
      } else if (tariffType === 'tou') {
        // TOU tariff can use either basic (kwh + demand) or advanced (onPeakKwh + offPeakKwh + demand) format
        if (params.onPeakKwh !== undefined && params.offPeakKwh !== undefined) {
          // Advanced TOU format: onPeakKwh, offPeakKwh, and demand
          if (params.demand === undefined) {
            this.errors.push({
              field: 'demand',
              message: 'demand field is required for TOU tariff'
            });
          }
        } else if (params.kwh !== undefined) {
          // Basic TOU format: kwh and demand
          if (params.demand === undefined) {
            this.errors.push({
              field: 'demand',
              message: 'demand field is required for TOU tariff'
            });
          }
        } else {
          // Neither format provided
          this.errors.push({
            field: 'kwh',
            message: 'Either kwh (for basic TOU) or onPeakKwh/offPeakKwh (for advanced TOU) is required for TOU tariff'
          });
        }
      } else {
        this.errors.push({
          field: 'tariffType',
          message: 'Type 5 only supports normal and TOU tariffs'
        });
      }
    }
  }

  /**
   * Validate extreme values
   */
  validateExtremeValues(params, fields) {
    fields.forEach(field => {
      if (params[field] !== undefined) {
        const value = Number(params[field]);
        if (value === 0) {
          this.errors.push({
            field,
            message: `${field} cannot be zero`
          });
        } else if (value > 1000000) {
          this.errors.push({
            field,
            message: `${field} value is excessive`
          });
        }
      }
    });
  }

  /**
   * Validate data types
   */
  validateDataTypes(params, fields) {
    fields.forEach(field => {
      if (params[field] !== undefined) {
        if (typeof params[field] === 'string') {
          const numValue = Number(params[field]);
          if (isNaN(numValue)) {
            this.errors.push({
              field,
              message: `${field} must be a valid number`
            });
          }
        }
      }
    });
  }

  /**
   * Main validation method
   */
  validate(calculationType, tariffType, voltageLevel, params) {
    this.errors = [];

    // Create a combined params object for validation
    const allParams = {
      tariffType,
      voltageLevel,
      ...params
    };

    // Required fields validation
    this.validateRequired(allParams, ['tariffType', 'voltageLevel']);

    // Tariff type validation
    this.validateTariffType(calculationType, tariffType, voltageLevel);

    // Voltage level validation - we need to determine if this is PEA or MEA
    // Since both use the same calculation types, we'll check the voltage level format
    // PEA uses: <22kV, 22-33kV, >=69kV
    // MEA uses: <12kV, 12-24kV, >=69kV
    if (voltageLevel === '<22kV' || voltageLevel === '22-33kV' || voltageLevel === '>=69kV') {
      // This is a PEA voltage level
      this.validateVoltageLevel(voltageLevel, ['<22kV', '22-33kV', '>=69kV']);
    } else if (voltageLevel === '<12kV' || voltageLevel === '12-24kV' || voltageLevel === '>=69kV') {
      // This is an MEA voltage level
      this.validateVoltageLevel(voltageLevel, ['<12kV', '12-24kV', '>=69kV']);
    } else {
      // Invalid voltage level
      this.errors.push({
        field: 'voltageLevel',
        message: `Invalid voltage level: ${voltageLevel}. Supported: <22kV, 22-33kV, >=69kV for PEA; <12kV, 12-24kV, >=69kV for MEA`
      });
    }

    // Business logic validation
    this.validateBusinessLogic(calculationType, tariffType, allParams);

    // Numeric validation for relevant fields
    const numericFields = ['kwh', 'onPeakKwh', 'offPeakKwh', 'demand', 'onPeakDemand', 'partialPeakDemand', 'offPeakDemand'];
    this.validateNumericValues(allParams, numericFields);

    // Extreme values validation
    this.validateExtremeValues(allParams, numericFields);

    // Data type validation
    this.validateDataTypes(allParams, numericFields);

    return this.errors;
  }

  /**
   * Check if validation passed
   */
  isValid() {
    return this.errors.length === 0;
  }

  /**
   * Get formatted error response
   */
  getErrorResponse() {
    return {
      success: false,
      error: 'Validation Error',
      details: this.errors,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ValidationEngine;
