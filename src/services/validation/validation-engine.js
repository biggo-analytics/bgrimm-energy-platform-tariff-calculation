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
    // Check if tariff type is supported
    const supportedTariffTypes = ['normal', 'tou', 'tod'];
    if (!supportedTariffTypes.includes(tariffType)) {
      this.errors.push({
        field: 'tariffType',
        message: `Invalid tariff type: ${tariffType}. Supported types: ${supportedTariffTypes.join(', ')}`
      });
      return;
    }

    if (calculationType === 'type-2') {
      if (tariffType !== 'tou') {
        this.errors.push({
          field: 'tariffType',
          message: 'Type 2 only supports TOU tariff'
        });
      }
    } else if (calculationType === 'type-5') {
      // Type-5 supports both normal and TOU tariffs for both MEA and PEA
      // PEA Type 5: only supports TOU tariff
      // MEA Type 5: supports both normal and TOU tariffs
      
      // Check if this is PEA-specific voltage level (not shared)
      if (voltageLevel === '<22kV' || voltageLevel === '22-33kV') {
        // PEA-specific voltage levels only support TOU for Type 5
        if (tariffType !== 'tou') {
          this.errors.push({
            field: 'tariffType',
            message: 'Type 5 only supports TOU tariff'
          });
        }
      } else if (voltageLevel === '<12kV' || voltageLevel === '12-24kV') {
        // MEA-specific voltage levels support both normal and TOU for Type 5
        if (tariffType === 'tod') {
          this.errors.push({
            field: 'tariffType',
            message: 'Type 5 only supports normal and TOU tariffs'
          });
        }
      } else if (voltageLevel === '>=69kV') {
        // Shared voltage level - we can't determine the provider from voltage alone
        // So we'll be permissive and allow both normal and TOU tariffs
        // The controller logic will determine the correct strategy
        if (tariffType === 'tod') {
          this.errors.push({
            field: 'tariffType',
            message: 'Type 5 only supports normal and TOU tariffs'
          });
        }
      }
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
            message: 'Type 2 does not support demand charges'
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
            message: `${field} must be greater than 0`
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
    // Note: >=69kV is shared between both providers
    if (voltageLevel === '<22kV' || voltageLevel === '22-33kV') {
      // This is a PEA-only voltage level
      this.validateVoltageLevel(voltageLevel, ['<22kV', '22-33kV', '>=69kV']);
    } else if (voltageLevel === '<12kV' || voltageLevel === '12-24kV') {
      // This is an MEA-only voltage level
      this.validateVoltageLevel(voltageLevel, ['<12kV', '12-24kV', '>=69kV']);
    } else if (voltageLevel === '>=69kV') {
      // This voltage level is shared by both PEA and MEA, so it's always valid
      // No validation needed
    } else {
      // Invalid voltage level
      this.errors.push({
        field: 'voltageLevel',
        message: `Invalid voltage level: ${voltageLevel}. Supported: <22kV, 22-33kV, >=69kV for PEA; <12kV, 12-24kV, >=69kV for MEA`
      });
    }

    // Additional validation: reject MEA voltage levels for PEA and vice versa
    // This is determined by the context (which service is calling this validation)
    // For now, we'll add a more specific error message for cross-provider voltage levels
    if (voltageLevel === '<12kV' || voltageLevel === '12-24kV') {
      // MEA voltage levels
      if (calculationType === 'type-2' || calculationType === 'type-3' || calculationType === 'type-4' || calculationType === 'type-5') {
        // This could be either MEA or PEA, but if it's PEA, it should fail
        // We'll let the business logic handle this
      }
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
