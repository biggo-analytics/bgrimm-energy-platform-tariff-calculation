/**
 * Base Electricity Service
 * Abstract base class for electricity calculation services
 */

const { 
  calculatePowerFactorCharge, 
  calculateTieredEnergyCharge, 
  calculateVAT, 
  calculateFTCharge, 
  calculateEffectiveDemandCharge,
  formatCalculationResult 
} = require('../utils/calculation-helpers');

class BaseElectricityService {
  constructor(rates, serviceCharge = null) {
    this.rates = rates;
    this.serviceCharge = serviceCharge;
  }

  /**
   * Main calculation dispatcher
   * @param {string} calculationType - Type of calculation (type-2, type-3, etc.)
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   */
  calculateBill(calculationType, data) {
    switch (calculationType) {
      case 'type-2':
        return this._calculateType2(data);
      case 'type-3':
        return this._calculateType3(data);
      case 'type-4':
        return this._calculateType4(data);
      case 'type-5':
        return this._calculateType5(data);
      default:
        throw new Error(`Invalid calculation type: ${calculationType}`);
    }
  }

  /**
   * Calculate Type 2 (Small Business/General Service)
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType2(data) {
    const { tariffType } = data;
    
    if (tariffType === 'normal') {
      return this._calculateType2Normal(data);
    } else if (tariffType === 'tou') {
      return this._calculateType2Tou(data);
    } else {
      throw new Error('Invalid tariff type for Type 2. Must be "normal" or "tou"');
    }
  }

  /**
   * Calculate Type 2 Normal tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType2Normal(data) {
    const { voltageLevel, ftRateSatang, usage } = data;
    const { total_kwh } = usage;
    
    const rates = this.rates.TYPE_2.normal[voltageLevel];
    const serviceCharge = rates.serviceCharge;
    
    let energyCharge;
    if (rates.energyRate) {
      // Flat rate for higher voltage levels
      energyCharge = total_kwh * rates.energyRate;
    } else {
      // Tiered rates for lower voltage levels
      energyCharge = calculateTieredEnergyCharge(total_kwh, rates.energyRates);
    }
    
    const baseTariff = energyCharge + serviceCharge;
    const ftCharge = calculateFTCharge(total_kwh, ftRateSatang);
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
   * Calculate Type 2 TOU tariff
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType2Tou(data) {
    const { voltageLevel, ftRateSatang, usage } = data;
    const { on_peak_kwh, off_peak_kwh } = usage;
    
    const rates = this.rates.TYPE_2.tou[voltageLevel];
    const serviceCharge = rates.serviceCharge;
    const energyCharge = (on_peak_kwh * rates.onPeakRate) + (off_peak_kwh * rates.offPeakRate);
    const totalKwh = on_peak_kwh + off_peak_kwh;
    
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
   * Calculate Type 3 (Medium Business/General Service)
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType3(data) {
    const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const rates = this.rates.TYPE_3[tariffType][voltageLevel];
    
    let calculatedDemandCharge, energyCharge, totalKwhForFt, overallPeakKw;
    
    if (tariffType === 'normal') {
      calculatedDemandCharge = usage.peak_kw * rates.demand;
      energyCharge = usage.total_kwh * rates.energy;
      totalKwhForFt = usage.total_kwh;
      overallPeakKw = usage.peak_kw;
    } else {
      calculatedDemandCharge = usage.on_peak_kw * rates.demand_on;
      energyCharge = (usage.on_peak_kwh * rates.energy_on) + (usage.off_peak_kwh * rates.energy_off);
      totalKwhForFt = usage.on_peak_kwh + usage.off_peak_kwh;
      overallPeakKw = Math.max(usage.on_peak_kw, usage.off_peak_kw);
    }
    
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
   * Calculate Type 4 (Large Business/General Service)
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType4(data) {
    const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    
    if (!this.rates.TYPE_4[tariffType]) {
      throw new Error(`Invalid tariff type for Type 4. Must be "tod" or "tou", received: ${tariffType}`);
    }
    
    if (!this.rates.TYPE_4[tariffType][voltageLevel]) {
      throw new Error(`Invalid voltage level for Type 4 ${tariffType}. Must be ">=69kV", "22-33kV", or "<22kV", received: ${voltageLevel}`);
    }
    
    const rates = this.rates.TYPE_4[tariffType][voltageLevel];
    
    let calculatedDemandCharge, energyCharge, totalKwhForFt, overallPeakKw;
    
    if (tariffType === 'tod') {
      calculatedDemandCharge = (usage.on_peak_kw * rates.demand_on) + 
                              (usage.partial_peak_kw * rates.demand_partial) + 
                              (usage.off_peak_kw * rates.demand_off);
      energyCharge = usage.total_kwh * rates.energy;
      totalKwhForFt = usage.total_kwh;
      overallPeakKw = Math.max(usage.on_peak_kw, usage.partial_peak_kw, usage.off_peak_kw);
    } else {
      calculatedDemandCharge = usage.on_peak_kw * rates.demand_on;
      energyCharge = (usage.on_peak_kwh * rates.energy_on) + (usage.off_peak_kwh * rates.energy_off);
      totalKwhForFt = usage.on_peak_kwh + usage.off_peak_kwh;
      overallPeakKw = Math.max(usage.on_peak_kw, usage.off_peak_kw);
    }
    
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
   * Calculate Type 5 (Specific Business)
   * @param {Object} data - Input data
   * @returns {Object} - Calculation result
   */
  _calculateType5(data) {
    const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    
    if (!this.rates.TYPE_5[tariffType]) {
      throw new Error(`Invalid tariff type for Type 5. Must be "normal" or "tou", received: ${tariffType}`);
    }
    
    if (!this.rates.TYPE_5[tariffType][voltageLevel]) {
      throw new Error(`Invalid voltage level for Type 5 ${tariffType}. Must be ">=69kV", "22-33kV", or "<22kV", received: ${voltageLevel}`);
    }
    
    const rates = this.rates.TYPE_5[tariffType][voltageLevel];
    
    let calculatedDemandCharge, energyCharge, totalKwhForFt, overallPeakKw;
    
    if (tariffType === 'normal') {
      calculatedDemandCharge = usage.peak_kw * rates.demand;
      energyCharge = usage.total_kwh * rates.energy;
      totalKwhForFt = usage.total_kwh;
      overallPeakKw = usage.peak_kw;
    } else {
      calculatedDemandCharge = usage.on_peak_kw * rates.demand_on;
      energyCharge = (usage.on_peak_kwh * rates.energy_on) + (usage.off_peak_kwh * rates.energy_off);
      totalKwhForFt = usage.on_peak_kwh + usage.off_peak_kwh;
      overallPeakKw = Math.max(usage.on_peak_kw, usage.off_peak_kw);
    }
    
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

module.exports = BaseElectricityService;
