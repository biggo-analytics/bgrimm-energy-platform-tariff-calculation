/**
 * Calculator Factory
 * 
 * Implements Factory Pattern and Dependency Injection to create appropriate
 * billing calculators based on customer type and tariff type.
 * 
 * Follows SOLID principles:
 * - Single Responsibility: Only responsible for creating calculators
 * - Open/Closed: Easy to add new calculator types without modification
 * - Dependency Inversion: Depends on abstractions, not concretions
 */

const { 
  EnergyBasedCalculator, 
  TimeOfUseEnergyCalculator 
} = require('./energy-based-calculator');

const {
  NormalDemandCalculator,
  TimeOfUseDemandCalculator,
  TimeOfDayCalculator
} = require('./demand-based-calculator');

/**
 * Factory for creating billing calculators
 * 
 * Encapsulates the logic for selecting the appropriate calculator
 * based on customer type and tariff configuration.
 */
class CalculatorFactory {
  constructor() {
    // Calculator registry - enables easy extension
    this._calculatorRegistry = this._initializeCalculatorRegistry();
  }
  
  /**
   * Create appropriate calculator for the given parameters
   * 
   * @param {string} customerType - Customer type (type-2, type-3, type-4, type-5)
   * @param {string} tariffType - Tariff type (normal, tou, tod)
   * @returns {BillingCalculationEngine} - Appropriate calculator instance
   * @throws {Error} - If no suitable calculator is found
   */
  createCalculator(customerType, tariffType) {
    const calculatorKey = this._getCalculatorKey(customerType, tariffType);
    
    if (!this._calculatorRegistry.has(calculatorKey)) {
      throw new Error(`No calculator available for ${customerType} with ${tariffType} tariff`);
    }
    
    const CalculatorClass = this._calculatorRegistry.get(calculatorKey);
    return new CalculatorClass();
  }
  
  /**
   * Get all supported calculator combinations
   * 
   * @returns {Array} - Array of {customerType, tariffType} objects
   */
  getSupportedCalculators() {
    const combinations = [];
    
    for (const [key] of this._calculatorRegistry) {
      const [customerType, tariffType] = key.split('_');
      combinations.push({ customerType, tariffType });
    }
    
    return combinations.sort((a, b) => {
      // Sort by customer type first, then tariff type
      if (a.customerType !== b.customerType) {
        return a.customerType.localeCompare(b.customerType);
      }
      return a.tariffType.localeCompare(b.tariffType);
    });
  }
  
  /**
   * Check if a calculator combination is supported
   * 
   * @param {string} customerType - Customer type
   * @param {string} tariffType - Tariff type
   * @returns {boolean} - True if combination is supported
   */
  isSupported(customerType, tariffType) {
    const calculatorKey = this._getCalculatorKey(customerType, tariffType);
    return this._calculatorRegistry.has(calculatorKey);
  }
  
  /**
   * Get calculator information for debugging/documentation
   * 
   * @param {string} customerType - Customer type
   * @param {string} tariffType - Tariff type
   * @returns {Object} - Calculator information
   */
  getCalculatorInfo(customerType, tariffType) {
    const calculatorKey = this._getCalculatorKey(customerType, tariffType);
    
    if (!this._calculatorRegistry.has(calculatorKey)) {
      return {
        supported: false,
        error: `No calculator available for ${customerType} with ${tariffType} tariff`
      };
    }
    
    const CalculatorClass = this._calculatorRegistry.get(calculatorKey);
    
    return {
      supported: true,
      customerType,
      tariffType,
      calculatorClass: CalculatorClass.name,
      description: this._getCalculatorDescription(customerType, tariffType),
      billingComponents: this._getBillingComponents(customerType, tariffType)
    };
  }
  
  /**
   * Initialize the calculator registry with all supported combinations
   * 
   * @private
   * @returns {Map} - Map of calculator keys to calculator classes
   */
  _initializeCalculatorRegistry() {
    const registry = new Map();
    
    // Type 2 (Small General Service) calculators
    registry.set('type-2_normal', EnergyBasedCalculator);
    registry.set('type-2_tou', TimeOfUseEnergyCalculator);
    
    // Type 3 (Medium General Service) calculators
    registry.set('type-3_normal', NormalDemandCalculator);
    registry.set('type-3_tou', TimeOfUseDemandCalculator);
    
    // Type 4 (Large General Service) calculators
    registry.set('type-4_tou', TimeOfUseDemandCalculator);
    registry.set('type-4_tod', TimeOfDayCalculator);
    
    // Type 5 (Specific Business Service) calculators
    registry.set('type-5_normal', NormalDemandCalculator);
    registry.set('type-5_tou', TimeOfUseDemandCalculator);
    
    return registry;
  }
  
  /**
   * Generate calculator key from parameters
   * 
   * @private
   * @param {string} customerType - Customer type
   * @param {string} tariffType - Tariff type
   * @returns {string} - Calculator key
   */
  _getCalculatorKey(customerType, tariffType) {
    return `${customerType}_${tariffType}`;
  }
  
  /**
   * Get human-readable description for calculator
   * 
   * @private
   * @param {string} customerType - Customer type
   * @param {string} tariffType - Tariff type
   * @returns {string} - Calculator description
   */
  _getCalculatorDescription(customerType, tariffType) {
    const descriptions = {
      'type-2': 'Small General Service - Energy-based billing',
      'type-3': 'Medium General Service - Demand and energy billing',
      'type-4': 'Large General Service - Complex demand billing',
      'type-5': 'Specific Business Service - Demand and energy billing'
    };
    
    const tariffDescriptions = {
      'normal': 'Standard fixed-rate structure',
      'tou': 'Time of Use - Peak/off-peak rates',
      'tod': 'Time of Day - Three-tier demand pricing'
    };
    
    return `${descriptions[customerType]} with ${tariffDescriptions[tariffType]}`;
  }
  
  /**
   * Get billing components for calculator type
   * 
   * @private
   * @param {string} customerType - Customer type
   * @param {string} tariffType - Tariff type
   * @returns {Array} - List of billing components
   */
  _getBillingComponents(customerType, tariffType) {
    const baseComponents = ['energyCharge', 'serviceCharge', 'ftCharge', 'vat'];
    
    if (customerType === 'type-2') {
      return [...baseComponents, 'baseTariff', 'totalBill'];
    } else {
      return [
        ...baseComponents, 
        'calculatedDemandCharge', 
        'effectiveDemandCharge', 
        'pfCharge', 
        'subTotal', 
        'grandTotal'
      ];
    }
  }
}

// Create singleton instance
const calculatorFactory = new CalculatorFactory();

module.exports = {
  CalculatorFactory,
  calculatorFactory
};
