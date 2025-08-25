/**
 * Shared Validation Utilities
 * Common validation functions used across MEA and PEA controllers
 */

// Business logic constants
const VALIDATION_LIMITS = {
  MIN_FT_RATE: 0,
  MAX_FT_RATE: 100,
  MIN_KVAR: 0,
  MAX_KVAR: 100000,
  MIN_DEMAND: 0,
  MAX_DEMAND: 1000000,
  MIN_KWH: 0,
  MAX_KWH: 10000000,
  MIN_KW: 0,
  MAX_KW: 100000
};

/**
 * Validates calculation input with required fields
 * @param {Object} ctx - Koa context
 * @param {Array} requiredFields - Array of required field names
 * @returns {boolean} - True if validation passes, false otherwise
 */
const validateCalculationInput = (ctx, requiredFields) => {
  const { body } = ctx.request;
  
  if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
    ctx.status = 400;
    ctx.body = { error: 'Request body is required' };
    return false;
  }

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      ctx.status = 400;
      ctx.body = { error: `Missing required field: ${field}` };
      return false;
    }
  }

  return true;
};

/**
 * Validates voltage level for a specific provider
 * @param {string} voltageLevel - Voltage level to validate
 * @param {string} provider - Provider (mea or pea)
 * @returns {boolean} - True if valid, false otherwise
 */
const validateVoltageLevel = (voltageLevel, provider) => {
  if (!voltageLevel) return false;
  
  const validLevels = provider === 'mea' 
    ? ['>=69kV', '12-24kV', '<12kV']
    : ['>=69kV', '22-33kV', '<22kV'];
  
  return validLevels.includes(voltageLevel);
};

/**
 * Validates tariff type
 * @param {string} tariffType - Tariff type to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateTariffType = (tariffType) => {
  if (!tariffType) return false;
  const validTypes = ['normal', 'tou', 'tod'];
  return validTypes.includes(tariffType);
};

/**
 * Validates numeric value with business logic constraints
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {Object} options - Validation options with min/max limits
 * @returns {Object} - { isValid: boolean, error?: string }
 */
const validateNumericValue = (value, fieldName, options = {}) => {
  if (value === 0) return { isValid: true }; // Allow zero values
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  if (value < 0) {
    return { isValid: false, error: `${fieldName} must be non-negative` };
  }
  
  // Apply business logic validations based on field type
  if (fieldName === 'ftRateSatang') {
    if (value < VALIDATION_LIMITS.MIN_FT_RATE || value > VALIDATION_LIMITS.MAX_FT_RATE) {
      return { isValid: false, error: `${fieldName} must be between ${VALIDATION_LIMITS.MIN_FT_RATE} and ${VALIDATION_LIMITS.MAX_FT_RATE} satang` };
    }
  } else if (fieldName === 'peakKvar') {
    if (value > VALIDATION_LIMITS.MAX_KVAR) {
      return { isValid: false, error: `${fieldName} must not exceed ${VALIDATION_LIMITS.MAX_KVAR} kVAR` };
    }
  } else if (fieldName === 'highestDemandChargeLast12m') {
    if (value > VALIDATION_LIMITS.MAX_DEMAND) {
      return { isValid: false, error: `${fieldName} must not exceed ${VALIDATION_LIMITS.MAX_DEMAND} baht` };
    }
  }

  // Apply custom range if provided
  if (options.min !== undefined && value < options.min) {
    return { isValid: false, error: `${fieldName} must be at least ${options.min}` };
  }
  if (options.max !== undefined && value > options.max) {
    return { isValid: false, error: `${fieldName} must not exceed ${options.max}` };
  }

  return { isValid: true };
};

/**
 * Sanitizes and validates input data
 * @param {Object} input - Raw input data
 * @returns {Object} - { isValid: boolean, data?: Object, errors?: Array }
 */
const sanitizeAndValidateInput = (input) => {
  const errors = [];
  const sanitizedData = {};
  
  if (!input || typeof input !== 'object') {
    return { isValid: false, errors: ['Invalid input data'] };
  }
  
  // Sanitize string fields
  const stringFields = ['tariffType', 'voltageLevel'];
  for (const field of stringFields) {
    if (input[field] !== undefined) {
      const sanitized = String(input[field]).trim();
      if (sanitized.length === 0) {
        errors.push(`${field} cannot be empty`);
      } else if (sanitized.length > 50) {
        errors.push(`${field} is too long (max 50 characters)`);
      } else {
        sanitizedData[field] = sanitized;
      }
    }
  }
  
  // Sanitize numeric fields
  const numericFields = ['ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m'];
  for (const field of numericFields) {
    if (input[field] !== undefined) {
      const numValue = Number(input[field]);
      if (isNaN(numValue)) {
        errors.push(`${field} must be a valid number`);
      } else {
        sanitizedData[field] = numValue;
      }
    }
  }
  
  // Sanitize usage object
  if (input.usage && typeof input.usage === 'object') {
    sanitizedData.usage = {};
    for (const [key, value] of Object.entries(input.usage)) {
      if (value !== undefined) {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(`usage.${key} must be a valid number`);
        } else {
          sanitizedData.usage[key] = numValue;
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    data: sanitizedData,
    errors
  };
};

/**
 * Validates business logic relationships between fields
 * @param {Object} data - Validated input data
 * @returns {Object} - { isValid: boolean, errors?: Array }
 */
const validateBusinessLogic = (data) => {
  const errors = [];
  
  // Validate kVAR vs demand relationship for power factor
  if (data.peakKvar && data.usage) {
    const maxDemand = Math.max(
      data.usage.peak_kw || 0,
      data.usage.on_peak_kw || 0,
      data.usage.partial_peak_kw || 0,
      data.usage.off_peak_kw || 0
    );
    
    if (maxDemand > 0) {
      const powerFactor = maxDemand / Math.sqrt(maxDemand * maxDemand + data.peakKvar * data.peakKvar);
      if (powerFactor < 0.5) {
        errors.push('Power factor appears unreasonably low - please check kVAR and kW values');
      }
    }
  }
  
  // Validate demand charge vs usage consistency
  if (data.highestDemandChargeLast12m && data.usage) {
    const currentMaxDemand = Math.max(
      data.usage.peak_kw || 0,
      data.usage.on_peak_kw || 0,
      data.usage.partial_peak_kw || 0,
      data.usage.off_peak_kw || 0
    );
    
    // Rough estimate - if current demand is 10x higher than historical charge suggests
    const estimatedHistoricalDemand = data.highestDemandChargeLast12m / 300; // rough rate estimate
    if (currentMaxDemand > estimatedHistoricalDemand * 10) {
      errors.push('Current demand appears inconsistent with historical demand charge - please verify values');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates usage fields based on tariff type and calculation type
 * @param {Object} usage - Usage object to validate
 * @param {string} tariffType - Tariff type (normal, tou, tod)
 * @param {string} calculationType - Calculation type (type-2, type-3, type-4, type-5)
 * @returns {Object} - { isValid: boolean, error?: string }
 */
const validateUsageFields = (usage, tariffType, calculationType) => {
  if (!usage) {
    return { isValid: false, error: 'Usage object is required' };
  }

  if (calculationType === 'type-2') {
    if (tariffType === 'normal') {
      if (!usage.total_kwh && usage.total_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: total_kwh' };
      }
    } else if (tariffType === 'tou') {
      if (!usage.on_peak_kwh && usage.on_peak_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: on_peak_kwh' };
      }
      if (!usage.off_peak_kwh && usage.off_peak_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: off_peak_kwh' };
      }
    }
  } else if (calculationType === 'type-3' || calculationType === 'type-5') {
    if (tariffType === 'normal') {
      if (!usage.peak_kw && usage.peak_kw !== 0) {
        return { isValid: false, error: 'Missing required field: peak_kw' };
      }
      if (!usage.total_kwh && usage.total_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: total_kwh' };
      }
    } else if (tariffType === 'tou') {
      if (!usage.on_peak_kw && usage.on_peak_kw !== 0) {
        return { isValid: false, error: 'Missing required field: on_peak_kw' };
      }
      if (!usage.on_peak_kwh && usage.on_peak_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: on_peak_kwh' };
      }
      if (!usage.off_peak_kw && usage.off_peak_kw !== 0) {
        return { isValid: false, error: 'Missing required field: off_peak_kw' };
      }
      if (!usage.off_peak_kwh && usage.off_peak_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: off_peak_kwh' };
      }
    }
  } else if (calculationType === 'type-4') {
    if (tariffType === 'tod') {
      if (!usage.on_peak_kw && usage.on_peak_kw !== 0) {
        return { isValid: false, error: 'Missing required field: on_peak_kw' };
      }
      if (!usage.partial_peak_kw && usage.partial_peak_kw !== 0) {
        return { isValid: false, error: 'Missing required field: partial_peak_kw' };
      }
      if (!usage.off_peak_kw && usage.off_peak_kw !== 0) {
        return { isValid: false, error: 'Missing required field: off_peak_kw' };
      }
      if (!usage.total_kwh && usage.total_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: total_kwh' };
      }
    } else if (tariffType === 'tou') {
      if (!usage.on_peak_kw && usage.on_peak_kw !== 0) {
        return { isValid: false, error: 'Missing required field: on_peak_kw' };
      }
      if (!usage.on_peak_kwh && usage.on_peak_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: on_peak_kwh' };
      }
      if (!usage.off_peak_kw && usage.off_peak_kw !== 0) {
        return { isValid: false, error: 'Missing required field: off_peak_kw' };
      }
      if (!usage.off_peak_kwh && usage.off_peak_kwh !== 0) {
        return { isValid: false, error: 'Missing required field: off_peak_kwh' };
      }
    }
  }

  // Validate usage field values are valid numbers and not negative
  const usageFields = Object.keys(usage);
  for (const field of usageFields) {
    const value = usage[field];
    if (typeof value !== 'number' || isNaN(value)) {
      return { isValid: false, error: `${field} must be a valid number` };
    }
    if (value < 0) {
      return { isValid: false, error: `${field} must be a positive number, received: ${value}` };
    }
  }

  return { isValid: true };
};

/**
 * Gets tariff type error message
 * @param {string} calculationType - Calculation type
 * @param {string} tariffType - Invalid tariff type
 * @returns {string} - Error message
 */
const getTariffTypeErrorMessage = (calculationType, tariffType) => {
  const typeNumber = calculationType.replace('type-', '');
  const validTypes = calculationType === 'type-4' ? ['tod', 'tou'] : ['normal', 'tou'];
  return `Invalid tariff type for Type ${typeNumber}. Must be "${validTypes.join('" or "')}", received: ${tariffType}`;
};

/**
 * Gets voltage level error message
 * @param {string} calculationType - Calculation type
 * @param {string} tariffType - Tariff type
 * @param {string} voltageLevel - Invalid voltage level
 * @param {string} provider - Provider (mea or pea)
 * @returns {string} - Error message
 */
const getVoltageLevelErrorMessage = (calculationType, tariffType, voltageLevel, provider) => {
  const typeNumber = calculationType.replace('type-', '');
  const validLevels = provider === 'mea' 
    ? ['>=69kV', '12-24kV', '<12kV']
    : ['>=69kV', '22-33kV', '<22kV'];
  
  const levelsText = validLevels.length > 1 
    ? `"${validLevels.slice(0, -1).join('", "')}", or "${validLevels[validLevels.length - 1]}"`
    : `"${validLevels[0]}"`;
  return `Invalid voltage level for Type ${typeNumber} ${tariffType}. Must be ${levelsText}, received: ${voltageLevel}`;
};

module.exports = {
  validateCalculationInput,
  validateVoltageLevel,
  validateTariffType,
  validateNumericValue,
  validateUsageFields,
  getTariffTypeErrorMessage,
  getVoltageLevelErrorMessage,
  sanitizeAndValidateInput,
  validateBusinessLogic,
  VALIDATION_LIMITS
};
