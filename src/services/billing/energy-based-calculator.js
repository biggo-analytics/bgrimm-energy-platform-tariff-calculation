/**
 * Energy-Based Billing Calculator
 * 
 * Specialized calculator for Type 2 customers (Small General Service)
 * that are billed primarily based on energy consumption.
 * 
 * Follows Single Responsibility Principle by focusing only on energy-based calculations.
 */

const { BillingCalculationEngine } = require('./billing-calculation-engine');
const { calculateTieredEnergyCharge } = require('../../utils/calculation-helpers');

/**
 * Calculator for energy-based billing (Type 2 - Small General Service)
 * 
 * Handles both flat-rate and tiered-rate energy billing structures.
 * Does not include demand charges or power factor calculations.
 */
class EnergyBasedCalculator extends BillingCalculationEngine {
  /**
   * Calculate energy charge for Type 2 customers
   * 
   * Uses either flat rates (higher voltage) or tiered rates (lower voltage)
   * to encourage energy conservation among smaller consumers.
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Energy charge amount
   */
  _calculateEnergyCharge(context) {
    const rates = context.rates;
    const totalEnergyConsumption = this._getTotalEnergyConsumption(context);
    
    // Check if this is a flat-rate structure (higher voltage customers)
    if (rates.energyRate) {
      return this._calculateFlatRateEnergy(totalEnergyConsumption, rates.energyRate);
    }
    
    // Use tiered rate structure (lower voltage customers)
    if (rates.energyRates) {
      return this._calculateTieredRateEnergy(totalEnergyConsumption, rates.energyRates);
    }
    
    throw new Error('No valid energy rate structure found in rates configuration');
  }
  
  /**
   * Calculate energy charge using flat rate structure
   * 
   * @private
   * @param {number} totalEnergyKwh - Total energy consumption
   * @param {number} flatRate - Flat energy rate per kWh
   * @returns {number} - Energy charge amount
   */
  _calculateFlatRateEnergy(totalEnergyKwh, flatRate) {
    return totalEnergyKwh * flatRate;
  }
  
  /**
   * Calculate energy charge using tiered rate structure
   * 
   * @private
   * @param {number} totalEnergyKwh - Total energy consumption
   * @param {Array} tieredRates - Array of tiered rate objects
   * @returns {number} - Energy charge amount
   */
  _calculateTieredRateEnergy(totalEnergyKwh, tieredRates) {
    return calculateTieredEnergyCharge(totalEnergyKwh, tieredRates);
  }
  
  /**
   * Get total energy consumption from usage data
   * 
   * @private
   * @param {Object} context - Calculation context
   * @returns {number} - Total energy consumption in kWh
   */
  _getTotalEnergyConsumption(context) {
    const usage = context.usage;
    
    // For normal tariff, use direct total
    if (usage.total_kwh !== undefined) {
      return usage.total_kwh;
    }
    
    // For TOU tariff, sum peak and off-peak
    if (usage.on_peak_kwh !== undefined && usage.off_peak_kwh !== undefined) {
      return usage.on_peak_kwh + usage.off_peak_kwh;
    }
    
    throw new Error('Unable to determine total energy consumption from usage data');
  }
}

/**
 * Calculator for Time-of-Use energy billing
 * 
 * Handles energy billing with different rates for peak and off-peak periods.
 * Encourages load shifting to off-peak hours.
 */
class TimeOfUseEnergyCalculator extends BillingCalculationEngine {
  /**
   * Calculate energy charge for TOU billing
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Energy charge amount
   */
  _calculateEnergyCharge(context) {
    const rates = context.rates;
    const usage = context.usage;
    
    if (!rates.onPeakRate || !rates.offPeakRate) {
      throw new Error('TOU rates missing: onPeakRate and offPeakRate are required');
    }
    
    if (usage.on_peak_kwh === undefined || usage.off_peak_kwh === undefined) {
      throw new Error('TOU usage data missing: on_peak_kwh and off_peak_kwh are required');
    }
    
    const onPeakCharge = usage.on_peak_kwh * rates.onPeakRate;
    const offPeakCharge = usage.off_peak_kwh * rates.offPeakRate;
    
    return onPeakCharge + offPeakCharge;
  }
}

module.exports = {
  EnergyBasedCalculator,
  TimeOfUseEnergyCalculator
};
