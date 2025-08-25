/**
 * Normal Tariff Strategy
 * Handles normal tariff calculations for all customer types
 */

const BaseTariffStrategy = require('./base-tariff-strategy');
const { 
  calculateTieredEnergyCharge, 
  calculateVAT, 
  calculateFTCharge, 
  calculateEffectiveDemandCharge,
  calculatePowerFactorCharge,
  formatCalculationResult 
} = require('../../utils/calculation-helpers');

class NormalTariffStrategy extends BaseTariffStrategy {
  /**
   * Get tariff type for this strategy
   * @returns {string} - Always returns 'normal'
   */
  getTariffType() {
    return 'normal';
  }

  /**
   * Calculate normal tariff for any customer type
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculate(calculationType, data) {
    // Check if calculation type supports normal tariff before validation
    if (calculationType === 'type-4') {
      throw new Error('Type 4 does not support normal tariff. Use TOD or TOU tariff.');
    }
    
    this.validateInput(calculationType, data);
    
    switch (calculationType) {
      case 'type-2':
        return this._calculateType2Normal(data);
      case 'type-3':
        return this._calculateType3Normal(data);
      case 'type-5':
        return this._calculateType5Normal(data);
      default:
        throw new Error(`Unsupported calculation type: ${calculationType}`);
    }
  }

  /**
   * Calculate Type 2 Normal tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType2Normal(data) {
    const { voltageLevel, ftRateSatang, usage } = data;
    const rates = this.getRates('type-2', voltageLevel);
    const { totalKwh } = this.calculateUsageTotals(usage, 'type-2');
    
    const serviceCharge = rates.serviceCharge;
    
    let energyCharge;
    if (rates.energyRate) {
      // Flat rate for higher voltage levels
      energyCharge = totalKwh * rates.energyRate;
    } else {
      // Tiered rates for lower voltage levels
      energyCharge = calculateTieredEnergyCharge(totalKwh, rates.energyRates);
    }
    
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
   * Calculate Type 3 Normal tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType3Normal(data) {
    const { voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const rates = this.getRates('type-3', voltageLevel);
    const { totalKwhForFt, overallPeakKw } = this.calculateUsageTotals(usage, 'type-3');
    
    const calculatedDemandCharge = usage.peak_kw * rates.demand;
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
   * Calculate Type 5 Normal tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType5Normal(data) {
    const { voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const rates = this.getRates('type-5', voltageLevel);
    const { totalKwhForFt, overallPeakKw } = this.calculateUsageTotals(usage, 'type-5');
    
    const calculatedDemandCharge = usage.peak_kw * rates.demand;
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
}

module.exports = NormalTariffStrategy;
