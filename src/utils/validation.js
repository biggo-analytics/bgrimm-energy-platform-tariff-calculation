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
    if (!body[field]) {
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
  const validLevels = {
    mea: ['<12kV', '12-24kV', '>=69kV'],
    pea: ['<22kV', '22-33kV', '>=69kV']
  };
  
  return validLevels[provider]?.includes(voltageLevel) || false;
};

/**
 * Validates tariff type
 * @param {string} tariffType - Tariff type to validate
 * @param {string} calculationType - Calculation type (type-2, type-3, etc.)
 * @returns {boolean} - True if valid, false otherwise
 */
const validateTariffType = (tariffType, calculationType) => {
  const validTypes = {
    'type-2': ['normal', 'tou'],
    'type-3': ['normal', 'tou'],
    'type-4': ['tod', 'tou'],
    'type-5': ['normal', 'tou']
  };
  
  return validTypes[calculationType]?.includes(tariffType) || false;
};

/**
 * Validates numeric values
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - { isValid: boolean, error?: string }
 */
const validateNumericValue = (value, fieldName) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (value < 0) {
    return { isValid: false, error: `${fieldName} must be non-negative` };
  }
  
  return { isValid: true };
};

/**
 * Get validation error message for tariff type
 * @param {string} calculationType - Calculation type
 * @param {string} tariffType - Invalid tariff type
 * @returns {string} - Error message
 */
const getTariffTypeErrorMessage = (calculationType, tariffType) => {
  const validTypes = {
    'type-2': ['normal', 'tou'],
    'type-3': ['normal', 'tou'],
    'type-4': ['tod', 'tou'],
    'type-5': ['normal', 'tou']
  };
  
  const valid = validTypes[calculationType] || [];
  const typeDisplay = calculationType.replace('type-', 'Type ');
  return `Invalid tariff type for ${typeDisplay}. Must be "${valid.join('" or "')}", received: ${tariffType}`;
};

/**
 * Get validation error message for voltage level
 * @param {string} calculationType - Calculation type
 * @param {string} tariffType - Tariff type
 * @param {string} voltageLevel - Invalid voltage level
 * @returns {string} - Error message
 */
const getVoltageLevelErrorMessage = (calculationType, tariffType, voltageLevel) => {
  const validLevels = ['>=69kV', '22-33kV', '<22kV'];
  const typeDisplay = calculationType.replace('type-', 'Type ');
  return `Invalid voltage level for ${typeDisplay} ${tariffType}. Must be "${validLevels.join('", "')}", received: ${voltageLevel}`;
};

module.exports = {
  validateCalculationInput,
  validateVoltageLevel,
  validateTariffType,
  validateNumericValue,
  getTariffTypeErrorMessage,
  getVoltageLevelErrorMessage
};
