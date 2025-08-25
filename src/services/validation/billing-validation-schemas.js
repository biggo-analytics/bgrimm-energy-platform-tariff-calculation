/**
 * Billing Validation Schemas
 * 
 * Pre-configured validation schemas for different billing scenarios.
 * Eliminates duplication by providing reusable validation configurations.
 * 
 * Follows Single Responsibility Principle by focusing only on validation schema definitions.
 */

const { ValidationComposer } = require('./validation-engine');
const { VOLTAGE_LEVELS, TARIFF_TYPES, CUSTOMER_CALCULATION_TYPES } = require('../../utils/constants');

/**
 * Validation Schema Factory
 * 
 * Creates validation schemas for different billing calculation scenarios.
 */
class BillingValidationSchemas {
  /**
   * Get validation schema for a specific calculation type
   * 
   * @param {string} calculationType - Type of calculation (type-2, type-3, type-4, type-5)
   * @param {string} provider - Provider (mea, pea)
   * @returns {ValidationComposer} - Configured validation composer
   */
  static getSchemaForCalculationType(calculationType, provider = 'mea') {
    const schemaMap = {
      'type-2': () => this._createType2Schema(provider),
      'type-3': () => this._createType3Schema(provider),
      'type-4': () => this._createType4Schema(provider),
      'type-5': () => this._createType5Schema(provider)
    };
    
    const schemaFactory = schemaMap[calculationType];
    if (!schemaFactory) {
      throw new Error(`No validation schema available for calculation type: ${calculationType}`);
    }
    
    return schemaFactory();
  }
  
  /**
   * Get base validation schema common to all calculation types
   * 
   * @param {string} provider - Provider (mea, pea)
   * @returns {ValidationComposer} - Base validation composer
   */
  static getBaseSchema(provider = 'mea') {
    const composer = new ValidationComposer();
    
    // Basic required fields
    composer
      .field('tariffType')
      .required()
      .oneOf(Object.values(TARIFF_TYPES));
    
    composer
      .field('voltageLevel')
      .required()
      .custom((value, fieldName, context) => {
        return this._validateVoltageLevel(value, provider);
      });
    
    composer
      .field('ftRateSatang')
      .required()
      .numeric({ min: 0, max: 100 }); // Reasonable range for fuel adjustment rate
    
    return composer;
  }
  
  /**
   * Create validation schema for Type 2 (Small General Service)
   * 
   * @private
   * @param {string} provider - Provider
   * @returns {ValidationComposer} - Type 2 validation schema
   */
  static _createType2Schema(provider) {
    const composer = this.getBaseSchema(provider);
    
    // Type 2 specific usage validation
    composer
      .field('usage')
      .required()
      .object()
      .custom((usage, fieldName, context) => {
        return this._validateType2Usage(usage, context);
      });
    
    return composer;
  }
  
  /**
   * Create validation schema for Type 3 (Medium General Service)
   * 
   * @private
   * @param {string} provider - Provider
   * @returns {ValidationComposer} - Type 3 validation schema
   */
  static _createType3Schema(provider) {
    const composer = this.getBaseSchema(provider);
    
    // Type 3 specific fields
    composer
      .field('peakKvar')
      .required()
      .numeric({ min: 0 });
    
    composer
      .field('highestDemandChargeLast12m')
      .required()
      .numeric({ min: 0 });
    
    composer
      .field('usage')
      .required()
      .object()
      .custom((usage, fieldName, context) => {
        return this._validateDemandBasedUsage(usage, context, 'type-3');
      });
    
    return composer;
  }
  
  /**
   * Create validation schema for Type 4 (Large General Service)
   * 
   * @private
   * @param {string} provider - Provider
   * @returns {ValidationComposer} - Type 4 validation schema
   */
  static _createType4Schema(provider) {
    const composer = this.getBaseSchema(provider);
    
    // Type 4 specific fields
    composer
      .field('peakKvar')
      .required()
      .numeric({ min: 0 });
    
    composer
      .field('highestDemandChargeLast12m')
      .required()
      .numeric({ min: 0 });
    
    // Type 4 has limited tariff types (no normal tariff)
    composer
      .field('tariffType')
      .required()
      .oneOf(['tou', 'tod'])
      .custom((tariffType, fieldName, context) => {
        if (tariffType === 'normal') {
          return {
            isValid: false,
            errors: ['Type 4 does not support normal tariff. Use TOD or TOU tariff.']
          };
        }
        return { isValid: true };
      });
    
    composer
      .field('usage')
      .required()
      .object()
      .custom((usage, fieldName, context) => {
        return this._validateType4Usage(usage, context);
      });
    
    return composer;
  }
  
  /**
   * Create validation schema for Type 5 (Specific Business Service)
   * 
   * @private
   * @param {string} provider - Provider
   * @returns {ValidationComposer} - Type 5 validation schema
   */
  static _createType5Schema(provider) {
    const composer = this.getBaseSchema(provider);
    
    // Type 5 has same requirements as Type 3
    composer
      .field('peakKvar')
      .required()
      .numeric({ min: 0 });
    
    composer
      .field('highestDemandChargeLast12m')
      .required()
      .numeric({ min: 0 });
    
    composer
      .field('usage')
      .required()
      .object()
      .custom((usage, fieldName, context) => {
        return this._validateDemandBasedUsage(usage, context, 'type-5');
      });
    
    return composer;
  }
  
  /**
   * Validate voltage level for provider
   * 
   * @private
   * @param {string} voltageLevel - Voltage level to validate
   * @param {string} provider - Provider (mea, pea)
   * @returns {Object} - Validation result
   */
  static _validateVoltageLevel(voltageLevel, provider) {
    const validLevels = provider === 'mea' 
      ? ['<12kV', '12-24kV', '>=69kV']
      : ['<22kV', '22-33kV', '>=69kV'];
    
    if (!validLevels.includes(voltageLevel)) {
      return {
        isValid: false,
        errors: [`Invalid voltage level for ${provider.toUpperCase()}: ${voltageLevel}. Valid options: ${validLevels.join(', ')}`]
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Validate Type 2 usage data
   * 
   * @private
   * @param {Object} usage - Usage data
   * @param {Object} context - Validation context
   * @returns {Object} - Validation result
   */
  static _validateType2Usage(usage, context) {
    const errors = [];
    const tariffType = context.data?.tariffType;
    
    if (tariffType === 'normal') {
      if (usage.total_kwh === undefined || usage.total_kwh === null) {
        errors.push('usage.total_kwh is required for normal tariff');
      } else if (typeof usage.total_kwh !== 'number' || usage.total_kwh < 0) {
        errors.push('usage.total_kwh must be a non-negative number');
      }
    } else if (tariffType === 'tou') {
      if (usage.on_peak_kwh === undefined || usage.on_peak_kwh === null) {
        errors.push('usage.on_peak_kwh is required for TOU tariff');
      } else if (typeof usage.on_peak_kwh !== 'number' || usage.on_peak_kwh < 0) {
        errors.push('usage.on_peak_kwh must be a non-negative number');
      }
      
      if (usage.off_peak_kwh === undefined || usage.off_peak_kwh === null) {
        errors.push('usage.off_peak_kwh is required for TOU tariff');
      } else if (typeof usage.off_peak_kwh !== 'number' || usage.off_peak_kwh < 0) {
        errors.push('usage.off_peak_kwh must be a non-negative number');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate demand-based usage data (Types 3, 5)
   * 
   * @private
   * @param {Object} usage - Usage data
   * @param {Object} context - Validation context
   * @param {string} calculationType - Calculation type
   * @returns {Object} - Validation result
   */
  static _validateDemandBasedUsage(usage, context, calculationType) {
    const errors = [];
    const tariffType = context.data?.tariffType;
    
    if (tariffType === 'normal') {
      // Normal tariff requires total_kwh and peak_kw
      if (usage.total_kwh === undefined || usage.total_kwh === null) {
        errors.push('usage.total_kwh is required for normal tariff');
      } else if (typeof usage.total_kwh !== 'number' || usage.total_kwh < 0) {
        errors.push('usage.total_kwh must be a non-negative number');
      }
      
      if (usage.peak_kw === undefined || usage.peak_kw === null) {
        errors.push('usage.peak_kw is required for normal tariff');
      } else if (typeof usage.peak_kw !== 'number' || usage.peak_kw < 0) {
        errors.push('usage.peak_kw must be a non-negative number');
      }
    } else if (tariffType === 'tou') {
      // TOU tariff requires peak/off-peak breakdown
      const requiredFields = ['on_peak_kwh', 'off_peak_kwh', 'on_peak_kw'];
      
      for (const field of requiredFields) {
        if (usage[field] === undefined || usage[field] === null) {
          errors.push(`usage.${field} is required for TOU tariff`);
        } else if (typeof usage[field] !== 'number' || usage[field] < 0) {
          errors.push(`usage.${field} must be a non-negative number`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate Type 4 usage data
   * 
   * @private
   * @param {Object} usage - Usage data
   * @param {Object} context - Validation context
   * @returns {Object} - Validation result
   */
  static _validateType4Usage(usage, context) {
    const errors = [];
    const tariffType = context.data?.tariffType;
    
    if (tariffType === 'tod') {
      // TOD requires three demand periods and total energy
      const requiredFields = ['on_peak_kw', 'partial_peak_kw', 'off_peak_kw', 'total_kwh'];
      
      for (const field of requiredFields) {
        if (usage[field] === undefined || usage[field] === null) {
          errors.push(`usage.${field} is required for TOD tariff`);
        } else if (typeof usage[field] !== 'number' || usage[field] < 0) {
          errors.push(`usage.${field} must be a non-negative number`);
        }
      }
    } else if (tariffType === 'tou') {
      // TOU requires peak/off-peak breakdown
      const requiredFields = ['on_peak_kwh', 'off_peak_kwh', 'on_peak_kw'];
      
      for (const field of requiredFields) {
        if (usage[field] === undefined || usage[field] === null) {
          errors.push(`usage.${field} is required for TOU tariff`);
        } else if (typeof usage[field] !== 'number' || usage[field] < 0) {
          errors.push(`usage.${field} must be a non-negative number`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = {
  BillingValidationSchemas
};