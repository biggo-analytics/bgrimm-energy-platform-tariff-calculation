/**
 * Validation Composition Engine
 * 
 * Implements Composite Pattern and Command Pattern to create reusable
 * validation components that can be combined and applied consistently.
 * 
 * Eliminates DRY violations in validation logic by providing composable
 * validation rules that can be mixed and matched.
 */

const { ValidationError } = require('../../utils/error-handler');

/**
 * Base Validation Rule Interface
 * 
 * All validation rules implement this interface for consistent behavior.
 */
class ValidationRule {
  /**
   * Validate input data
   * 
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field being validated
   * @param {Object} context - Additional validation context
   * @returns {ValidationResult} - Validation result
   */
  validate(value, fieldName, context = {}) {
    throw new Error('validate method must be implemented by subclass');
  }
}

/**
 * Validation result container
 */
class ValidationResult {
  constructor(isValid, errors = []) {
    this.isValid = isValid;
    this.errors = Array.isArray(errors) ? errors : [errors];
  }
  
  /**
   * Combine multiple validation results
   */
  static combine(...results) {
    const isValid = results.every(result => result.isValid);
    const errors = results.flatMap(result => result.errors);
    return new ValidationResult(isValid, errors);
  }
}

// ============================================================================
// CONCRETE VALIDATION RULES
// ============================================================================

/**
 * Required Field Validation
 */
class RequiredFieldRule extends ValidationRule {
  validate(value, fieldName, context = {}) {
    const isEmpty = value === undefined || value === null || value === '';
    
    if (isEmpty) {
      return new ValidationResult(false, 
        `Missing required field: ${fieldName}. This field is mandatory for the calculation.`
      );
    }
    
    return new ValidationResult(true);
  }
}

/**
 * Numeric Value Validation
 */
class NumericValueRule extends ValidationRule {
  constructor(options = {}) {
    super();
    this.min = options.min;
    this.max = options.max;
    this.allowZero = options.allowZero !== false; // Default to true
  }
  
  validate(value, fieldName, context = {}) {
    if (value === undefined || value === null) {
      return new ValidationResult(true); // Let RequiredFieldRule handle this
    }
    
    if (typeof value !== 'number' || isNaN(value)) {
      return new ValidationResult(false, 
        `${fieldName} must be a valid number, received: ${typeof value}`
      );
    }
    
    if (!this.allowZero && value === 0) {
      return new ValidationResult(false, 
        `${fieldName} cannot be zero`
      );
    }
    
    if (value < 0) {
      return new ValidationResult(false, 
        `${fieldName} cannot be negative, received: ${value}`
      );
    }
    
    if (this.min !== undefined && value < this.min) {
      return new ValidationResult(false, 
        `${fieldName} must be at least ${this.min}, received: ${value}`
      );
    }
    
    if (this.max !== undefined && value > this.max) {
      return new ValidationResult(false, 
        `${fieldName} cannot exceed ${this.max}, received: ${value}`
      );
    }
    
    return new ValidationResult(true);
  }
}

/**
 * Enumeration Value Validation
 */
class EnumValueRule extends ValidationRule {
  constructor(allowedValues, options = {}) {
    super();
    this.allowedValues = Array.isArray(allowedValues) ? allowedValues : [allowedValues];
    this.caseSensitive = options.caseSensitive !== false; // Default to true
  }
  
  validate(value, fieldName, context = {}) {
    if (value === undefined || value === null) {
      return new ValidationResult(true); // Let RequiredFieldRule handle this
    }
    
    const valueToCheck = this.caseSensitive ? value : String(value).toLowerCase();
    const allowedToCheck = this.caseSensitive 
      ? this.allowedValues 
      : this.allowedValues.map(v => String(v).toLowerCase());
    
    if (!allowedToCheck.includes(valueToCheck)) {
      return new ValidationResult(false, 
        `${fieldName} must be one of: ${this.allowedValues.join(', ')}. Received: ${value}`
      );
    }
    
    return new ValidationResult(true);
  }
}

/**
 * Object Structure Validation
 */
class ObjectStructureRule extends ValidationRule {
  constructor(requiredFields = [], optionalFields = []) {
    super();
    this.requiredFields = requiredFields;
    this.optionalFields = optionalFields;
    this.allowedFields = [...requiredFields, ...optionalFields];
  }
  
  validate(value, fieldName, context = {}) {
    if (value === undefined || value === null) {
      return new ValidationResult(true); // Let RequiredFieldRule handle this
    }
    
    if (typeof value !== 'object' || Array.isArray(value)) {
      return new ValidationResult(false, 
        `${fieldName} must be an object, received: ${typeof value}`
      );
    }
    
    const errors = [];
    
    // Check for missing required fields
    for (const required of this.requiredFields) {
      if (value[required] === undefined || value[required] === null) {
        errors.push(`${fieldName}.${required} is required`);
      }
    }
    
    // Check for unexpected fields
    const providedFields = Object.keys(value);
    for (const provided of providedFields) {
      if (!this.allowedFields.includes(provided)) {
        errors.push(`${fieldName}.${provided} is not a valid field`);
      }
    }
    
    return new ValidationResult(errors.length === 0, errors);
  }
}

/**
 * Conditional Validation Rule
 * 
 * Applies validation only when a condition is met
 */
class ConditionalRule extends ValidationRule {
  constructor(condition, rule) {
    super();
    this.condition = condition;
    this.rule = rule;
  }
  
  validate(value, fieldName, context = {}) {
    if (!this.condition(value, fieldName, context)) {
      return new ValidationResult(true); // Condition not met, skip validation
    }
    
    return this.rule.validate(value, fieldName, context);
  }
}

// ============================================================================
// VALIDATION COMPOSER
// ============================================================================

/**
 * Validation Composer
 * 
 * Combines multiple validation rules for a field and provides
 * a fluent interface for building validation chains.
 */
class ValidationComposer {
  constructor() {
    this.fieldValidators = new Map();
  }
  
  /**
   * Add validation for a field
   * 
   * @param {string} fieldName - Name of the field
   * @returns {FieldValidator} - Field validator for chaining
   */
  field(fieldName) {
    if (!this.fieldValidators.has(fieldName)) {
      this.fieldValidators.set(fieldName, new FieldValidator(fieldName));
    }
    return this.fieldValidators.get(fieldName);
  }
  
  /**
   * Validate all configured fields
   * 
   * @param {Object} data - Data to validate
   * @param {Object} context - Validation context
   * @returns {ValidationResult} - Combined validation result
   */
  validate(data, context = {}) {
    const results = [];
    
    for (const [fieldName, fieldValidator] of this.fieldValidators) {
      const fieldValue = this._getNestedValue(data, fieldName);
      const result = fieldValidator.validate(fieldValue, context);
      results.push(result);
    }
    
    return ValidationResult.combine(...results);
  }
  
  /**
   * Get nested value from object using dot notation
   * 
   * @private
   * @param {Object} obj - Object to search
   * @param {string} path - Dot-separated path
   * @returns {*} - Value at path
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

/**
 * Field Validator
 * 
 * Manages validation rules for a specific field
 */
class FieldValidator {
  constructor(fieldName) {
    this.fieldName = fieldName;
    this.rules = [];
  }
  
  /**
   * Add required validation
   */
  required() {
    this.rules.push(new RequiredFieldRule());
    return this;
  }
  
  /**
   * Add numeric validation
   */
  numeric(options = {}) {
    this.rules.push(new NumericValueRule(options));
    return this;
  }
  
  /**
   * Add enumeration validation
   */
  oneOf(allowedValues, options = {}) {
    this.rules.push(new EnumValueRule(allowedValues, options));
    return this;
  }
  
  /**
   * Add object structure validation
   */
  object(requiredFields = [], optionalFields = []) {
    this.rules.push(new ObjectStructureRule(requiredFields, optionalFields));
    return this;
  }
  
  /**
   * Add conditional validation
   */
  when(condition, rule) {
    this.rules.push(new ConditionalRule(condition, rule));
    return this;
  }
  
  /**
   * Add custom validation rule
   */
  custom(validationFunction) {
    this.rules.push({
      validate: (value, fieldName, context) => {
        try {
          const result = validationFunction(value, fieldName, context);
          return result instanceof ValidationResult ? result : new ValidationResult(!!result);
        } catch (error) {
          return new ValidationResult(false, error.message);
        }
      }
    });
    return this;
  }
  
  /**
   * Validate field value
   * 
   * @param {*} value - Value to validate
   * @param {Object} context - Validation context
   * @returns {ValidationResult} - Validation result
   */
  validate(value, context = {}) {
    const results = this.rules.map(rule => 
      rule.validate(value, this.fieldName, context)
    );
    
    return ValidationResult.combine(...results);
  }
}

module.exports = {
  ValidationRule,
  ValidationResult,
  RequiredFieldRule,
  NumericValueRule,
  EnumValueRule,
  ObjectStructureRule,
  ConditionalRule,
  ValidationComposer,
  FieldValidator
};
