/**
 * Shared Validation Utilities
 * Common validation functions used across MEA and PEA controllers
 */

/**
 * Validates calculation input with required fields
 * @param {Object} ctx - Koa context
 * @param {Array} requiredFields - Array of required field names
 * @returns {boolean} - True if validation passes, false otherwise
 */
const validateCalculationInput = (ctx, requiredFields) => {
  const { body } = ctx.request;
  
  if (!body) {
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
 * Validates numeric value
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} - { isValid: boolean, error?: string }
 */
const validateNumericValue = (value, fieldName) => {
  if (value === 0) return { isValid: true }; // Allow zero values
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  if (value < 0) {
    return { isValid: false, error: `${fieldName} must be non-negative` };
  }
  return { isValid: true };
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
  getVoltageLevelErrorMessage
};
