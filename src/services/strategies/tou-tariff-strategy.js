/**
 * TOU (Time of Use) Tariff Strategy
 * Handles time-of-use tariff calculations for all customer types
 */

const BaseTariffStrategy = require('./base-tariff-strategy');
const { 
  calculateVAT, 
  calculateFTCharge, 
  calculateEffectiveDemandCharge,
  calculatePowerFactorCharge,
  formatCalculationResult 
} = require('../../utils/calculation-helpers');

class TOUTariffStrategy extends BaseTariffStrategy {
  /**
   * Get tariff type for this strategy
   * @returns {string} - Always returns 'tou'
   */
  getTariffType() {
    return 'tou';
  }

  /**
   * Calculate TOU tariff for any customer type
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculate(calculationType, data) {
    this.validateInput(calculationType, data);
    
    switch (calculationType) {
      case 'type-2':
        return this._calculateType2TOU(data);
      case 'type-3':
        return this._calculateType3TOU(data);
      case 'type-4':
        return this._calculateType4TOU(data);
      case 'type-5':
        return this._calculateType5TOU(data);
      default:
        throw new Error(`Unsupported calculation type: ${calculationType}`);
    }
  }

  /**
   * Calculate Type 2 TOU tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType2TOU(data) {
    const { voltageLevel, ftRateSatang, usage } = data;
    const rates = this.getRates('type-2', voltageLevel);
    const { onPeakKwh, offPeakKwh, totalKwh } = this.calculateUsageTotals(usage, 'type-2');
    
    const serviceCharge = rates.serviceCharge;
    const energyCharge = (onPeakKwh * rates.onPeakRate) + (offPeakKwh * rates.offPeakRate);
    
    const baseTariff = energyCharge + serviceCharge;
    const ftCharge = calculateFTCharge(totalKwh, ftRateSatang);
    const vat = calculateVAT(baseTariff + ftCharge);
    const totalBill = baseTariff + ftCharge + vat;
    
    const result = {
      energyCharge,
      serviceCharge,
      baseTariff,
      ftCharge,
      vat,
      totalBill
    };
    
    return formatCalculationResult(result);
  }

  /**
   * Calculate Type 3 TOU tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType3TOU(data) {
    const { voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const rates = this.getRates('type-3', voltageLevel);
    const { totalKwhForFt, overallPeakKw } = this.calculateUsageTotals(usage, 'type-3');
    
    const calculatedDemandCharge = usage.on_peak_kw * rates.demand_on;
    const energyCharge = (usage.on_peak_kwh * rates.energy_on) + (usage.off_peak_kwh * rates.energy_off);
    
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
   * Calculate Type 4 TOU tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType4TOU(data) {
    const { voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const rates = this.getRates('type-4', voltageLevel);
    const { totalKwhForFt, overallPeakKw } = this.calculateUsageTotals(usage, 'type-4');
    
    const calculatedDemandCharge = usage.on_peak_kw * rates.demand_on;
    const energyCharge = (usage.on_peak_kwh * rates.energy_on) + (usage.off_peak_kwh * rates.energy_off);
    
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
   * Calculate Type 5 TOU tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType5TOU(data) {
    const { voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const rates = this.getRates('type-5', voltageLevel);
    const { totalKwhForFt, overallPeakKw } = this.calculateUsageTotals(usage, 'type-5');
    
    const calculatedDemandCharge = usage.on_peak_kw * rates.demand_on;
    const energyCharge = (usage.on_peak_kwh * rates.energy_on) + (usage.off_peak_kwh * rates.energy_off);
    
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
}

module.exports = TOUTariffStrategy;
