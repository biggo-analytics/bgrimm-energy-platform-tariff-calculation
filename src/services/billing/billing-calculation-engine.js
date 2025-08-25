/**
 * Modular Billing Calculation Engine
 * 
 * This engine provides composable billing components that follow DRY and SOLID principles.
 * Each component has a single responsibility and can be combined to build complex calculations.
 * 
 * Design Principles Applied:
 * - Single Responsibility: Each component handles one aspect of billing
 * - Open/Closed: Easy to extend with new components without modifying existing ones
 * - Dependency Inversion: Components depend on abstractions, not concretions
 * - DRY: Common patterns extracted into reusable components
 */

const { 
  calculateVAT, 
  calculateFTCharge, 
  calculatePowerFactorCharge, 
  calculateEffectiveDemandCharge,
  formatCalculationResult 
} = require('../../utils/calculation-helpers');

/**
 * Base Billing Calculator - Template Method Pattern
 * 
 * Provides the skeleton for all billing calculations while allowing
 * subclasses to override specific steps.
 */
class BillingCalculationEngine {
  /**
   * Main calculation template method
   * This method defines the algorithm structure and cannot be overridden
   * 
   * @param {Object} billingData - Input billing data
   * @param {Object} rates - Rate configuration
   * @returns {Object} - Formatted calculation result
   */
  calculateBill(billingData, rates) {
    // Template method - defines the calculation flow
    const calculationContext = this._createCalculationContext(billingData, rates);
    
    const billingComponents = {
      ...this._calculateEnergyComponents(calculationContext),
      ...this._calculateDemandComponents(calculationContext),
      ...this._calculateAdjustmentComponents(calculationContext)
    };
    
    const billingTotals = this._calculateTotals(billingComponents, calculationContext);
    const finalResult = { ...billingComponents, ...billingTotals };
    
    return formatCalculationResult(finalResult);
  }
  
  /**
   * Create calculation context with normalized data
   * @protected
   * @param {Object} billingData - Raw billing data
   * @param {Object} rates - Rate configuration
   * @returns {Object} - Normalized calculation context
   */
  _createCalculationContext(billingData, rates) {
    return {
      billingData,
      rates,
      serviceCharge: rates.serviceCharge || 0,
      // Normalize common fields for consistent access
      voltageLevel: billingData.voltageLevel,
      fuelAdjustmentRate: billingData.ftRateSatang,
      usage: billingData.usage,
      // Optional fields with defaults
      peakReactivePower: billingData.peakKvar || 0,
      historicalPeakDemand: billingData.highestDemandChargeLast12m || 0
    };
  }
  
  /**
   * Calculate energy-related billing components
   * @protected
   * @param {Object} context - Calculation context
   * @returns {Object} - Energy billing components
   */
  _calculateEnergyComponents(context) {
    const energyCharge = this._calculateEnergyCharge(context);
    const serviceCharge = context.serviceCharge;
    
    return {
      energyCharge,
      serviceCharge
    };
  }
  
  /**
   * Calculate demand-related billing components (for Types 3-5)
   * @protected
   * @param {Object} context - Calculation context
   * @returns {Object} - Demand billing components
   */
  _calculateDemandComponents(context) {
    // Default implementation for Type 2 (no demand charges)
    if (this._requiresDemandCharges(context)) {
      const calculatedDemandCharge = this._calculateDemandCharge(context);
      const effectiveDemandCharge = calculateEffectiveDemandCharge(
        calculatedDemandCharge, 
        context.historicalPeakDemand
      );
      const powerFactorCharge = this._calculatePowerFactorCharge(context);
      
      return {
        calculatedDemandCharge,
        effectiveDemandCharge,
        pfCharge: powerFactorCharge
      };
    }
    
    return {};
  }
  
  /**
   * Calculate adjustment components (FT, VAT)
   * @protected
   * @param {Object} context - Calculation context
   * @returns {Object} - Adjustment components
   */
  _calculateAdjustmentComponents(context) {
    const totalEnergyForFT = this._getTotalEnergyForFuelAdjustment(context);
    const ftCharge = calculateFTCharge(totalEnergyForFT, context.fuelAdjustmentRate);
    
    return {
      ftCharge
    };
  }
  
  /**
   * Calculate billing totals
   * @protected
   * @param {Object} components - Individual billing components
   * @param {Object} context - Calculation context
   * @returns {Object} - Calculated totals
   */
  _calculateTotals(components, context) {
    // Calculate subtotal before VAT
    const subtotalComponents = [
      components.energyCharge || 0,
      components.serviceCharge || 0,
      components.effectiveDemandCharge || 0,
      components.pfCharge || 0
    ];
    
    const baseTariff = this._hasMultipleComponents(components) 
      ? subtotalComponents.reduce((sum, component) => sum + component, 0)
      : (components.energyCharge || 0) + (components.serviceCharge || 0);
    
    const subTotal = baseTariff + (components.ftCharge || 0);
    const vat = calculateVAT(subTotal);
    const finalTotal = this._getFinalTotalFieldName(components);
    
    const totals = {
      vat
    };
    
    // Add appropriate total field based on calculation type
    if (this._hasMultipleComponents(components)) {
      totals.subTotal = subTotal;
      totals.grandTotal = subTotal + vat;
    } else {
      totals.baseTariff = baseTariff;
      totals.totalBill = subTotal + vat;
    }
    
    return totals;
  }
  
  // Abstract methods to be implemented by concrete calculators
  
  /**
   * Calculate energy charge - must be implemented by subclasses
   * @abstract
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Energy charge amount
   */
  _calculateEnergyCharge(context) {
    throw new Error('_calculateEnergyCharge must be implemented by subclass');
  }
  
  /**
   * Calculate demand charge - implemented by demand-based calculators
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Demand charge amount
   */
  _calculateDemandCharge(context) {
    return 0; // Default for non-demand-based calculations
  }
  
  /**
   * Calculate power factor charge
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Power factor charge amount
   */
  _calculatePowerFactorCharge(context) {
    const overallPeakKw = this._getOverallPeakDemand(context);
    return calculatePowerFactorCharge(context.peakReactivePower, overallPeakKw);
  }
  
  // Helper methods
  
  /**
   * Check if calculation requires demand charges
   * @protected
   * @param {Object} context - Calculation context
   * @returns {boolean} - True if demand charges are required
   */
  _requiresDemandCharges(context) {
    return false; // Override in demand-based calculators
  }
  
  /**
   * Get total energy consumption for fuel adjustment calculation
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Total energy in kWh
   */
  _getTotalEnergyForFuelAdjustment(context) {
    const usage = context.usage;
    
    // Try direct total first
    if (usage.total_kwh !== undefined) {
      return usage.total_kwh;
    }
    
    // Calculate from peak/off-peak breakdown
    if (usage.on_peak_kwh !== undefined && usage.off_peak_kwh !== undefined) {
      return usage.on_peak_kwh + usage.off_peak_kwh;
    }
    
    throw new Error('Unable to determine total energy consumption for fuel adjustment');
  }
  
  /**
   * Get overall peak demand for power factor calculation
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Peak demand in kW
   */
  _getOverallPeakDemand(context) {
    const usage = context.usage;
    
    // Try direct peak first
    if (usage.peak_kw !== undefined) {
      return usage.peak_kw;
    }
    
    // Calculate from time-based demand
    const demandValues = [];
    if (usage.on_peak_kw !== undefined) demandValues.push(usage.on_peak_kw);
    if (usage.off_peak_kw !== undefined) demandValues.push(usage.off_peak_kw);
    if (usage.partial_peak_kw !== undefined) demandValues.push(usage.partial_peak_kw);
    
    if (demandValues.length === 0) {
      throw new Error('Unable to determine peak demand for power factor calculation');
    }
    
    return Math.max(...demandValues);
  }
  
  /**
   * Check if calculation has multiple component types (complex calculation)
   * @protected
   * @param {Object} components - Billing components
   * @returns {boolean} - True if multiple component types exist
   */
  _hasMultipleComponents(components) {
    return components.effectiveDemandCharge !== undefined;
  }
  
  /**
   * Get the appropriate final total field name
   * @protected
   * @param {Object} components - Billing components
   * @returns {string} - Field name for final total
   */
  _getFinalTotalFieldName(components) {
    return this._hasMultipleComponents(components) ? 'grandTotal' : 'totalBill';
  }
}

module.exports = {
  BillingCalculationEngine
};
