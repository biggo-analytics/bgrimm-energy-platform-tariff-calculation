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
   * Calculate Type 2 Normal tariff for Small General Service customers
   * 
   * Type 2 customers include small businesses and residential customers.
   * The calculation uses either flat rates (higher voltage) or tiered rates (lower voltage)
   * to encourage energy conservation among smaller consumers.
   * 
   * @param {Object} customerBillingData - Input data for calculation
   * @returns {Object} - Detailed calculation result with all charge components
   */
  _calculateType2Normal(customerBillingData) {
    const { voltageLevel, ftRateSatang, usage } = customerBillingData;
    const applicableRatesForVoltageLevel = this.getRates('type-2', voltageLevel);
    const { totalKwh: totalEnergyConsumptionKwh } = this.calculateUsageTotals(usage, 'type-2');
    
    // Fixed monthly service charge (varies by voltage level)
    const monthlyServiceCharge = applicableRatesForVoltageLevel.serviceCharge;
    
    // Calculate energy charge based on rate structure
    let energyConsumptionCharge;
    if (applicableRatesForVoltageLevel.energyRate) {
      // Higher voltage customers (12-24kV): Use flat rate structure
      // These customers typically have more predictable usage patterns
      energyConsumptionCharge = totalEnergyConsumptionKwh * applicableRatesForVoltageLevel.energyRate;
    } else {
      // Lower voltage customers (<12kV): Use tiered rate structure
      // Progressive rates encourage energy conservation
      energyConsumptionCharge = calculateTieredEnergyCharge(
        totalEnergyConsumptionKwh, 
        applicableRatesForVoltageLevel.energyRates
      );
    }
    
    // Calculate base tariff (energy + service charges before adjustments)
    const baseTariffBeforeAdjustments = energyConsumptionCharge + monthlyServiceCharge;
    
    // Apply fuel adjustment charge (varies monthly based on fuel costs)
    const fuelAdjustmentCharge = calculateFTCharge(totalEnergyConsumptionKwh, ftRateSatang);
    
    // Calculate VAT on total before VAT (7% as per Thai tax law)
    const taxableAmount = baseTariffBeforeAdjustments + fuelAdjustmentCharge;
    const valueAddedTaxAmount = calculateVAT(taxableAmount);
    
    // Calculate final bill total
    const finalBillAmount = baseTariffBeforeAdjustments + fuelAdjustmentCharge + valueAddedTaxAmount;
    
    const detailedCalculationResult = {
      energyCharge: energyConsumptionCharge,
      serviceCharge: monthlyServiceCharge,
      baseTariff: baseTariffBeforeAdjustments,
      ftCharge: fuelAdjustmentCharge,
      vat: valueAddedTaxAmount,
      totalBill: finalBillAmount
    };
    
    return formatCalculationResult(detailedCalculationResult);
  }

  /**
   * Calculate Type 3 Normal tariff for Medium General Service customers
   * 
   * Type 3 customers are medium-sized businesses with demand-based billing.
   * This includes both demand charges (based on peak kW) and energy charges (based on kWh).
   * Also includes power factor penalties and minimum bill protection.
   * 
   * @param {Object} customerBillingData - Input data for calculation
   * @returns {Object} - Detailed calculation result with all charge components
   */
  _calculateType3Normal(customerBillingData) {
    const { 
      voltageLevel, 
      ftRateSatang: fuelAdjustmentRateSatang, 
      peakKvar: peakReactivePowerKvar, 
      highestDemandChargeLast12m: historicalPeakDemandCharge, 
      usage 
    } = customerBillingData;
    
    const applicableRatesForVoltageLevel = this.getRates('type-3', voltageLevel);
    const { 
      totalKwhForFt: totalEnergyForFuelAdjustment, 
      overallPeakKw: peakActivePowerKw 
    } = this.calculateUsageTotals(usage, 'type-3');
    
    // Calculate demand charge based on peak power consumption (kW)
    const currentMonthDemandCharge = usage.peak_kw * applicableRatesForVoltageLevel.demand;
    
    // Calculate energy charge based on total consumption (kWh)
    const energyConsumptionCharge = usage.total_kwh * applicableRatesForVoltageLevel.energy;
    
    // Apply minimum bill protection (ensures demand charge doesn't fall below 70% of historical peak)
    const protectedDemandCharge = calculateEffectiveDemandCharge(
      currentMonthDemandCharge, 
      historicalPeakDemandCharge
    );
    
    // Calculate power factor penalty (applied when reactive power is excessive)
    const powerFactorPenaltyCharge = calculatePowerFactorCharge(
      peakReactivePowerKvar, 
      peakActivePowerKw
    );
    
    // Fixed monthly service charge
    const monthlyServiceCharge = applicableRatesForVoltageLevel.serviceCharge || this.serviceCharge;
    
    // Calculate subtotal of all base charges before fuel adjustment
    const baseTariffSubtotal = protectedDemandCharge + energyConsumptionCharge + powerFactorPenaltyCharge + monthlyServiceCharge;
    
    // Apply fuel adjustment charge
    const fuelAdjustmentCharge = calculateFTCharge(
      totalEnergyForFuelAdjustment, 
      fuelAdjustmentRateSatang
    );
    
    // Calculate subtotal before VAT
    const subtotalBeforeVat = baseTariffSubtotal + fuelAdjustmentCharge;
    
    // Calculate VAT (7%)
    const valueAddedTaxAmount = calculateVAT(subtotalBeforeVat);
    
    // Calculate final total
    const finalBillTotal = subtotalBeforeVat + valueAddedTaxAmount;
    
    const detailedCalculationResult = {
      calculatedDemandCharge: currentMonthDemandCharge,
      energyCharge: energyConsumptionCharge,
      effectiveDemandCharge: protectedDemandCharge,
      pfCharge: powerFactorPenaltyCharge,
      serviceCharge: monthlyServiceCharge,
      ftCharge: fuelAdjustmentCharge,
      subTotal: subtotalBeforeVat,
      vat: valueAddedTaxAmount,
      grandTotal: finalBillTotal
    };
    
    return formatCalculationResult(detailedCalculationResult);
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
