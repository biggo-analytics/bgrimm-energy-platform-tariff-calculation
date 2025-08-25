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
   * Calculate and normalize usage totals from raw usage data
   * 
   * This method processes different usage data formats and calculates totals needed
   * for billing calculations. It handles both simple (total values) and complex
   * (time-based breakdown) usage patterns.
   * 
   * @param {Object} rawUsageData - Raw usage data from customer meter
   * @param {string} customerCalculationType - Type of calculation (type-2, type-3, type-4, type-5)
   * @returns {Object} - Normalized usage totals for billing calculations
   */
  calculateUsageTotals(rawUsageData, customerCalculationType) {
    const normalizedUsageTotals = {};
    
    // Process Type 2 (Small General Service) usage data
    if (customerCalculationType === 'type-2') {
      normalizedUsageTotals.totalKwh = this._calculateTotalEnergyConsumption(rawUsageData);
      
      // For TOU tariff, preserve peak/off-peak breakdown
      if (this._hasTimeOfUsageBreakdown(rawUsageData)) {
        normalizedUsageTotals.onPeakKwh = rawUsageData.on_peak_kwh;
        normalizedUsageTotals.offPeakKwh = rawUsageData.off_peak_kwh;
      }
    }
    
    // Process Type 3, 4, 5 (Medium/Large General Service) usage data
    const DEMAND_BASED_CALCULATION_TYPES = ['type-3', 'type-4', 'type-5'];
    if (DEMAND_BASED_CALCULATION_TYPES.includes(customerCalculationType)) {
      // Calculate peak demand for demand charge calculation
      normalizedUsageTotals.overallPeakKw = this._calculateOverallPeakDemand(rawUsageData);
      
      // Calculate total energy consumption for FT (fuel adjustment) charge
      normalizedUsageTotals.totalKwhForFt = this._calculateTotalEnergyConsumption(rawUsageData);
    }
    
    return normalizedUsageTotals;
  }
  
  /**
   * Calculate total energy consumption from usage data
   * @private
   * @param {Object} usageData - Usage data object
   * @returns {number} - Total energy consumption in kWh
   */
  _calculateTotalEnergyConsumption(usageData) {
    // Use direct total if available
    if (usageData.total_kwh !== undefined) {
      return usageData.total_kwh;
    }
    
    // Calculate from time-of-use breakdown if available
    if (usageData.on_peak_kwh !== undefined && usageData.off_peak_kwh !== undefined) {
      return usageData.on_peak_kwh + usageData.off_peak_kwh;
    }
    
    throw new Error('Insufficient energy consumption data: missing total_kwh or peak/off-peak breakdown');
  }
  
  /**
   * Calculate overall peak demand from usage data
   * @private
   * @param {Object} usageData - Usage data object
   * @returns {number} - Overall peak demand in kW
   */
  _calculateOverallPeakDemand(usageData) {
    // Use direct peak if available (normal tariff)
    if (usageData.peak_kw !== undefined) {
      return usageData.peak_kw;
    }
    
    // Calculate from time-based demand data
    const demandValues = [];
    
    if (usageData.on_peak_kw !== undefined) demandValues.push(usageData.on_peak_kw);
    if (usageData.off_peak_kw !== undefined) demandValues.push(usageData.off_peak_kw);
    if (usageData.partial_peak_kw !== undefined) demandValues.push(usageData.partial_peak_kw);
    
    if (demandValues.length === 0) {
      throw new Error('Insufficient demand data: missing peak_kw or time-based demand breakdown');
    }
    
    // Return the maximum demand across all time periods
    return Math.max(...demandValues);
  }
  
  /**
   * Check if usage data includes time-of-use breakdown
   * @private
   * @param {Object} usageData - Usage data object
   * @returns {boolean} - True if TOU breakdown is available
   */
  _hasTimeOfUsageBreakdown(usageData) {
    return usageData.on_peak_kwh !== undefined && usageData.off_peak_kwh !== undefined;
  }
}

module.exports = BaseTariffStrategy;
