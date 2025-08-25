/**
 * Demand-Based Billing Calculator
 * 
 * Specialized calculator for Types 3-5 customers that include demand charges
 * in addition to energy charges. Handles complex billing structures with
 * power factor penalties and minimum bill protection.
 * 
 * Follows Single Responsibility Principle by focusing on demand-based calculations.
 */

const { BillingCalculationEngine } = require('./billing-calculation-engine');

/**
 * Base class for demand-based billing calculations (Types 3, 4, 5)
 * 
 * Provides common functionality for customers with demand charges,
 * power factor penalties, and minimum bill protection.
 */
class DemandBasedCalculator extends BillingCalculationEngine {
  /**
   * Demand-based customers always require demand charges
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {boolean} - Always true for demand-based customers
   */
  _requiresDemandCharges(context) {
    return true;
  }
}

/**
 * Calculator for Normal Demand-Based billing (Types 3, 5)
 * 
 * Handles standard demand and energy charges with single peak demand period.
 */
class NormalDemandCalculator extends DemandBasedCalculator {
  /**
   * Calculate energy charge for normal demand billing
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Energy charge amount
   */
  _calculateEnergyCharge(context) {
    const rates = context.rates;
    const usage = context.usage;
    
    if (!rates.energy) {
      throw new Error('Energy rate missing for normal demand calculation');
    }
    
    if (usage.total_kwh === undefined) {
      throw new Error('Total energy consumption (total_kwh) required for normal demand calculation');
    }
    
    return usage.total_kwh * rates.energy;
  }
  
  /**
   * Calculate demand charge for normal billing
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Demand charge amount
   */
  _calculateDemandCharge(context) {
    const rates = context.rates;
    const usage = context.usage;
    
    if (!rates.demand) {
      throw new Error('Demand rate missing for normal demand calculation');
    }
    
    if (usage.peak_kw === undefined) {
      throw new Error('Peak demand (peak_kw) required for normal demand calculation');
    }
    
    return usage.peak_kw * rates.demand;
  }
}

/**
 * Calculator for Time-of-Use Demand-Based billing (Types 3, 4, 5)
 * 
 * Handles TOU energy charges with separate peak/off-peak rates
 * and demand charges based on peak period demand.
 */
class TimeOfUseDemandCalculator extends DemandBasedCalculator {
  /**
   * Calculate energy charge for TOU demand billing
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Energy charge amount
   */
  _calculateEnergyCharge(context) {
    const rates = context.rates;
    const usage = context.usage;
    
    if (!rates.energy_on || !rates.energy_off) {
      throw new Error('TOU energy rates missing: energy_on and energy_off are required');
    }
    
    if (usage.on_peak_kwh === undefined || usage.off_peak_kwh === undefined) {
      throw new Error('TOU energy usage missing: on_peak_kwh and off_peak_kwh are required');
    }
    
    const onPeakEnergyCharge = usage.on_peak_kwh * rates.energy_on;
    const offPeakEnergyCharge = usage.off_peak_kwh * rates.energy_off;
    
    return onPeakEnergyCharge + offPeakEnergyCharge;
  }
  
  /**
   * Calculate demand charge for TOU billing
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Demand charge amount
   */
  _calculateDemandCharge(context) {
    const rates = context.rates;
    const usage = context.usage;
    
    if (!rates.demand_on) {
      throw new Error('TOU demand rate missing: demand_on is required');
    }
    
    if (usage.on_peak_kw === undefined) {
      throw new Error('TOU demand usage missing: on_peak_kw is required');
    }
    
    return usage.on_peak_kw * rates.demand_on;
  }
}

/**
 * Calculator for Time-of-Day (TOD) billing (Type 4 only)
 * 
 * Handles complex three-tier demand pricing with separate rates
 * for on-peak, partial-peak, and off-peak periods.
 */
class TimeOfDayCalculator extends DemandBasedCalculator {
  /**
   * Calculate energy charge for TOD billing
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Energy charge amount
   */
  _calculateEnergyCharge(context) {
    const rates = context.rates;
    const usage = context.usage;
    
    if (!rates.energy) {
      throw new Error('Energy rate missing for TOD calculation');
    }
    
    if (usage.total_kwh === undefined) {
      throw new Error('Total energy consumption (total_kwh) required for TOD calculation');
    }
    
    return usage.total_kwh * rates.energy;
  }
  
  /**
   * Calculate demand charge for TOD billing
   * 
   * Uses three-tier demand structure with separate rates for each time period.
   * 
   * @protected
   * @param {Object} context - Calculation context
   * @returns {number} - Total demand charge amount
   */
  _calculateDemandCharge(context) {
    const rates = context.rates;
    const usage = context.usage;
    
    // Validate required rates
    const requiredRates = ['demand_on', 'demand_partial', 'demand_off'];
    for (const rate of requiredRates) {
      if (!rates[rate]) {
        throw new Error(`TOD demand rate missing: ${rate} is required`);
      }
    }
    
    // Validate required usage data
    const requiredUsage = ['on_peak_kw', 'partial_peak_kw', 'off_peak_kw'];
    for (const usage_field of requiredUsage) {
      if (usage[usage_field] === undefined) {
        throw new Error(`TOD demand usage missing: ${usage_field} is required`);
      }
    }
    
    // Calculate demand charges for each time period
    const onPeakDemandCharge = usage.on_peak_kw * rates.demand_on;
    const partialPeakDemandCharge = usage.partial_peak_kw * rates.demand_partial;
    const offPeakDemandCharge = usage.off_peak_kw * rates.demand_off;
    
    return onPeakDemandCharge + partialPeakDemandCharge + offPeakDemandCharge;
  }
}

module.exports = {
  DemandBasedCalculator,
  NormalDemandCalculator,
  TimeOfUseDemandCalculator,
  TimeOfDayCalculator
};
