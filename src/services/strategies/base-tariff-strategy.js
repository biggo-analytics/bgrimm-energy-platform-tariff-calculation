/**
 * Base Tariff Strategy Interface
 * Abstract base class for all tariff calculation strategies
 */

class BaseTariffStrategy {
  constructor(rates, serviceCharge = null) {
    this.rates = rates;
    this.serviceCharge = serviceCharge;
  }

  /**
   * Abstract method for calculating tariff
   * Must be implemented by concrete strategy classes
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculate(calculationType, data) {
    throw new Error('calculate method must be implemented by concrete strategy classes');
  }

  /**
   * Get rates for specific calculation type and voltage level
   * @param {string} calculationType - Type of calculation
   * @param {string} voltageLevel - Voltage level
   * @returns {Object} - Rate configuration
   */
  getRates(calculationType, voltageLevel) {
    const typeKey = calculationType.toUpperCase().replace('-', '_');
    const tariffType = this.getTariffType();
    
    if (!this.rates[typeKey] || !this.rates[typeKey][tariffType] || !this.rates[typeKey][tariffType][voltageLevel]) {
      throw new Error(`Rates not found for ${calculationType}, ${tariffType}, ${voltageLevel}`);
    }
    
    return this.rates[typeKey][tariffType][voltageLevel];
  }

  /**
   * Get the tariff type for this strategy
   * Must be implemented by concrete strategy classes
   * @returns {string} - Tariff type (normal, tou, tod)
   */
  getTariffType() {
    throw new Error('getTariffType method must be implemented by concrete strategy classes');
  }

  /**
   * Validate input data for the strategy
   * @param {string} calculationType - Type of calculation
   * @param {Object} data - Input data
   * @returns {boolean} - True if valid
   */
  validateInput(calculationType, data) {
    const { tariffType, voltageLevel } = data;
    
    if (tariffType !== this.getTariffType()) {
      throw new Error(`Tariff type mismatch. Expected ${this.getTariffType()}, got ${tariffType}`);
    }

    try {
      this.getRates(calculationType, voltageLevel);
      return true;
    } catch (error) {
      throw new Error(`Invalid configuration: ${error.message}`);
    }
  }

  /**
   * Calculate usage totals from usage data
   * @param {Object} usage - Usage data
   * @param {string} calculationType - Type of calculation
   * @returns {Object} - Calculated totals
   */
  calculateUsageTotals(usage, calculationType) {
    const totals = {};
    
    // For type-2, calculate total kWh if needed
    if (calculationType === 'type-2') {
      if (usage.total_kwh !== undefined) {
        totals.totalKwh = usage.total_kwh;
      } else if (usage.on_peak_kwh !== undefined && usage.off_peak_kwh !== undefined) {
        totals.totalKwh = usage.on_peak_kwh + usage.off_peak_kwh;
        totals.onPeakKwh = usage.on_peak_kwh;
        totals.offPeakKwh = usage.off_peak_kwh;
      }
    }
    
    // For type-3, type-4, type-5, calculate overall peak kW
    if (['type-3', 'type-4', 'type-5'].includes(calculationType)) {
      if (usage.peak_kw !== undefined) {
        totals.overallPeakKw = usage.peak_kw;
      } else if (usage.on_peak_kw !== undefined && usage.off_peak_kw !== undefined) {
        totals.overallPeakKw = Math.max(usage.on_peak_kw, usage.off_peak_kw);
      }
      
      if (usage.partial_peak_kw !== undefined) {
        totals.overallPeakKw = Math.max(totals.overallPeakKw || 0, usage.partial_peak_kw);
      }
      
      // Calculate total kWh for FT calculation
      if (usage.total_kwh !== undefined) {
        totals.totalKwhForFt = usage.total_kwh;
      } else if (usage.on_peak_kwh !== undefined && usage.off_peak_kwh !== undefined) {
        totals.totalKwhForFt = usage.on_peak_kwh + usage.off_peak_kwh;
      }
    }
    
    return totals;
  }
}

module.exports = BaseTariffStrategy;
