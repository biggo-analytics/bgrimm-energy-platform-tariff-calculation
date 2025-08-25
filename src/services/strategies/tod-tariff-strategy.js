/**
 * TOD (Time of Day) Tariff Strategy
 * Handles time-of-day tariff calculations (Type 4 only)
 */

const BaseTariffStrategy = require('./base-tariff-strategy');
const { 
  calculateVAT, 
  calculateFTCharge, 
  calculateEffectiveDemandCharge,
  calculatePowerFactorCharge,
  formatCalculationResult 
} = require('../../utils/calculation-helpers');

class TODTariffStrategy extends BaseTariffStrategy {
  /**
   * Get tariff type for this strategy
   * @returns {string} - Always returns 'tod'
   */
  getTariffType() {
    return 'tod';
  }

  /**
   * Calculate TOD tariff (Type 4 only)
   * @param {string} calculationType - Type of calculation (must be type-4)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculate(calculationType, data) {
    // Check if calculation type supports TOD tariff before validation
    if (calculationType !== 'type-4') {
      throw new Error(`${calculationType} does not support TOD tariff. Use normal or TOU tariff.`);
    }
    
    this.validateInput(calculationType, data);
    
    switch (calculationType) {
      case 'type-4':
        return this._calculateType4TOD(data);
      default:
        throw new Error(`Unsupported calculation type: ${calculationType}`);
    }
  }

  /**
   * Calculate Type 4 TOD tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType4TOD(data) {
    const { voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const rates = this.getRates('type-4', voltageLevel);
    const { totalKwhForFt, overallPeakKw } = this.calculateUsageTotals(usage, 'type-4');
    
    // TOD has three demand periods: on-peak, partial-peak, and off-peak
    const calculatedDemandCharge = (usage.on_peak_kw * rates.demand_on) + 
                                  (usage.partial_peak_kw * rates.demand_partial) + 
                                  (usage.off_peak_kw * rates.demand_off);
    
    // Energy charge is flat rate for total consumption
    const energyCharge = usage.total_kwh * rates.energy;
    
    const effectiveDemandCharge = calculateEffectiveDemandCharge(calculatedDemandCharge, highestDemandChargeLast12m);
    const pfCharge = calculatePowerFactorCharge(peakKvar, overallPeakKw);
    const serviceCharge = rates.serviceCharge || this.serviceCharge;
    const totalBaseTariff = effectiveDemandCharge + energyCharge + pfCharge + serviceCharge;
    const ftCharge = calculateFTCharge(totalKwhForFt, ftRateSatang);
    const subTotal = totalBaseTariff + ftCharge;
    const vat = calculateVAT(subTotal);
    const grandTotal = subTotal + vat;
    
    const result = {
      calculatedDemandCharge,
      energyCharge,
      effectiveDemandCharge,
      pfCharge,
      serviceCharge,
      ftCharge,
      subTotal,
      vat,
      grandTotal
    };
    
    return formatCalculationResult(result);
  }

  /**
   * Enhanced usage totals calculation for TOD
   * Includes partial peak kW in overall peak calculation
   * @param {Object} usage - Usage data
   * @param {string} calculationType - Type of calculation
   * @returns {Object} - Calculated totals
   */
  calculateUsageTotals(usage, calculationType) {
    const totals = super.calculateUsageTotals(usage, calculationType);
    
    // For TOD, we need to consider partial_peak_kw in overall peak calculation
    if (calculationType === 'type-4' && usage.partial_peak_kw !== undefined) {
      const peaks = [usage.on_peak_kw, usage.partial_peak_kw, usage.off_peak_kw].filter(kw => kw !== undefined);
      totals.overallPeakKw = Math.max(...peaks);
    }
    
    return totals;
  }
}

module.exports = TODTariffStrategy;
