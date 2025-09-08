/**
 * Shared Calculation Utilities for Granular Strategy Pattern
 * Extracted common calculation patterns for reuse across all strategies
 */

const { VAT_RATE, PF_PENALTY_RATE, PF_THRESHOLD_FACTOR, MINIMUM_BILL_FACTOR } = require('../utils/constants');

/**
 * Calculates power factor penalty charge when reactive power exceeds threshold
 * @param {number} peakReactivePowerKvar - Peak reactive power in kVAR
 * @param {number} overallPeakActivePowerKw - Overall peak active power in kW
 * @returns {number} - Power factor penalty charge in Baht
 */
const calculatePowerFactorCharge = (peakReactivePowerKvar, overallPeakActivePowerKw) => {
  const allowedReactivePowerKvar = overallPeakActivePowerKw * PF_THRESHOLD_FACTOR;
  const excessReactivePowerKvar = Math.max(0, peakReactivePowerKvar - allowedReactivePowerKvar);
  const roundedExcessKvar = Math.round(excessReactivePowerKvar);
  const powerFactorPenaltyCharge = roundedExcessKvar * PF_PENALTY_RATE;
  return powerFactorPenaltyCharge;
};

/**
 * Calculates tiered energy charge for Type 2 customers using progressive rate structure
 * @param {number} totalEnergyConsumptionKwh - Total energy consumption in kWh
 * @param {Array} tieredEnergyRates - Array of rate objects with {threshold, rate} structure
 * @returns {number} - Total energy charge in Baht
 */
const calculateTieredEnergyCharge = (totalEnergyConsumptionKwh, tieredEnergyRates) => {
  let totalEnergyCharge = 0;
  let remainingConsumptionKwh = totalEnergyConsumptionKwh;
  
  const ratesSortedByThresholdDesc = [...tieredEnergyRates].sort((a, b) => b.threshold - a.threshold);
  
  for (let tierIndex = 0; tierIndex < ratesSortedByThresholdDesc.length; tierIndex++) {
    const currentTierRate = ratesSortedByThresholdDesc[tierIndex];
    const nextTierThreshold = tierIndex < ratesSortedByThresholdDesc.length - 1 
      ? ratesSortedByThresholdDesc[tierIndex + 1].threshold 
      : 0;
    
    if (remainingConsumptionKwh > currentTierRate.threshold) {
      const consumptionInCurrentTierKwh = remainingConsumptionKwh - Math.max(currentTierRate.threshold, nextTierThreshold);
      const chargeForCurrentTier = consumptionInCurrentTierKwh * currentTierRate.rate;
      
      totalEnergyCharge += chargeForCurrentTier;
      remainingConsumptionKwh = Math.max(currentTierRate.threshold, nextTierThreshold);
    }
  }
  
  return totalEnergyCharge;
};

/**
 * Calculates Value Added Tax (VAT) on electricity bill
 * @param {number} taxableAmountBeforeVat - Base amount subject to VAT in Baht
 * @returns {number} - VAT amount in Baht (7% of base amount)
 */
const calculateVAT = (taxableAmountBeforeVat) => {
  const vatAmount = taxableAmountBeforeVat * VAT_RATE;
  return vatAmount;
};

/**
 * Calculates Fuel Adjustment (FT) charge based on energy consumption
 * @param {number} totalEnergyConsumptionKwh - Total energy consumption in kWh
 * @param {number} fuelAdjustmentRateSatang - FT rate in satang per kWh (1/100 of Baht)
 * @returns {number} - Fuel adjustment charge in Baht
 */
const calculateFTCharge = (totalEnergyConsumptionKwh, fuelAdjustmentRateSatang) => {
  const fuelAdjustmentRateBaht = fuelAdjustmentRateSatang / 100;
  const fuelAdjustmentCharge = totalEnergyConsumptionKwh * fuelAdjustmentRateBaht;
  return fuelAdjustmentCharge;
};

/**
 * Calculates effective demand charge with minimum bill protection
 * @param {number} currentMonthDemandCharge - Demand charge calculated for current month in Baht
 * @param {number} historicalPeakDemandCharge - Highest demand charge in last 12 months in Baht
 * @returns {number} - Effective demand charge (higher of current or 70% of historical peak) in Baht
 */
const calculateEffectiveDemandCharge = (currentMonthDemandCharge, historicalPeakDemandCharge) => {
  const minimumDemandChargeBasedOnHistory = historicalPeakDemandCharge * MINIMUM_BILL_FACTOR;
  const effectiveDemandCharge = Math.max(currentMonthDemandCharge, minimumDemandChargeBasedOnHistory);
  return effectiveDemandCharge;
};

/**
 * Rounds a number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} - Rounded value
 */
const roundToDecimals = (value, decimals) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Formats calculation result with consistent precision rounding for billing accuracy
 * @param {Object} rawCalculationResult - Unformatted calculation result with numeric values
 * @returns {Object} - Formatted result with appropriate precision for each field
 */
const formatCalculationResult = (rawCalculationResult) => {
  const formattedResult = {};
  
  const PRECISION_RULES = {
    STANDARD_BILLING_PRECISION: ['energyCharge', 'baseTariff', 'subTotal', 'pfCharge'],
    HIGH_PRECISION_FINAL_AMOUNTS: ['vat', 'totalBill', 'grandTotal'],
    DEMAND_CHARGE_PRECISION: ['calculatedDemandCharge', 'effectiveDemandCharge'],
    FT_CHARGE_PRECISION: ['ftCharge']
  };
  
  for (const [fieldName, fieldValue] of Object.entries(rawCalculationResult)) {
    if (typeof fieldValue === 'number') {
      if (PRECISION_RULES.STANDARD_BILLING_PRECISION.includes(fieldName)) {
        formattedResult[fieldName] = roundToDecimals(fieldValue, 3);
      } else if (PRECISION_RULES.HIGH_PRECISION_FINAL_AMOUNTS.includes(fieldName)) {
        formattedResult[fieldName] = roundToDecimals(fieldValue, 5);
      } else if (PRECISION_RULES.DEMAND_CHARGE_PRECISION.includes(fieldName)) {
        formattedResult[fieldName] = roundToDecimals(fieldValue, 1);
      } else if (PRECISION_RULES.FT_CHARGE_PRECISION.includes(fieldName)) {
        formattedResult[fieldName] = roundToDecimals(fieldValue, 1);
      } else {
        formattedResult[fieldName] = fieldValue;
      }
    } else {
      formattedResult[fieldName] = fieldValue;
    }
  }
  
  return formattedResult;
};

/**
 * Tiered Rate Calculation Utility
 * Handles energy costs based on consumption thresholds (energyRates array structure)
 * @param {number} totalKwh - Total energy consumption
 * @param {Array} energyRates - Array of rate objects with {threshold, rate} structure
 * @returns {number} - Total energy charge
 */
const calculateTieredRateCharge = (totalKwh, energyRates) => {
  return calculateTieredEnergyCharge(totalKwh, energyRates);
};

/**
 * Time of Use (TOU) Calculation Utility
 * Calculates costs based on onPeakRate and offPeakRate
 * @param {number} onPeakKwh - On-peak energy consumption
 * @param {number} offPeakKwh - Off-peak energy consumption
 * @param {number} onPeakRate - On-peak rate per kWh
 * @param {number} offPeakRate - Off-peak rate per kWh
 * @returns {number} - Total TOU energy charge
 */
const calculateTOUCharge = (onPeakKwh, offPeakKwh, onPeakRate, offPeakRate) => {
  return (onPeakKwh * onPeakRate) + (offPeakKwh * offPeakRate);
};

/**
 * Time of Day (TOD) Calculation Utility
 * Handles demand_on, demand_partial, and demand_off calculations
 * @param {number} onPeakKw - On-peak demand
 * @param {number} partialPeakKw - Partial peak demand
 * @param {number} offPeakKw - Off-peak demand
 * @param {number} demandOnRate - On-peak demand rate
 * @param {number} demandPartialRate - Partial peak demand rate
 * @param {number} demandOffRate - Off-peak demand rate
 * @returns {number} - Total TOD demand charge
 */
const calculateTODDemandCharge = (onPeakKw, partialPeakKw, offPeakKw, demandOnRate, demandPartialRate, demandOffRate) => {
  return (onPeakKw * demandOnRate) + (partialPeakKw * demandPartialRate) + (offPeakKw * demandOffRate);
};

/**
 * Basic Demand Charge Calculation
 * Simple demand charge calculation for normal tariffs
 * @param {number} peakKw - Peak demand in kW
 * @param {number} demandRate - Demand rate per kW
 * @returns {number} - Demand charge
 */
const calculateBasicDemandCharge = (peakKw, demandRate) => {
  return peakKw * demandRate;
};

/**
 * Basic Energy Charge Calculation
 * Simple energy charge calculation for normal tariffs
 * @param {number} totalKwh - Total energy consumption
 * @param {number} energyRate - Energy rate per kWh
 * @returns {number} - Energy charge
 */
const calculateBasicEnergyCharge = (totalKwh, energyRate) => {
  return totalKwh * energyRate;
};

/**
 * Service Charge Calculation
 * Returns the service charge (fixed amount)
 * @param {number} serviceCharge - Service charge amount
 * @returns {number} - Service charge
 */
const calculateServiceCharge = (serviceCharge) => {
  return serviceCharge;
};

/**
 * Complete Bill Calculation Utility
 * Performs the complete bill calculation with all components
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Complete calculation result
 */
const calculateCompleteBill = (params) => {
  const {
    energyCharge,
    demandCharge = 0,
    serviceCharge,
    ftRateSatang,
    totalKwh,
    peakKvar = 0,
    overallPeakKw = 0,
    highestDemandChargeLast12m = 0,
    pfCharge = 0
  } = params;

  // Calculate effective demand charge with minimum bill protection
  const effectiveDemandCharge = calculateEffectiveDemandCharge(demandCharge, highestDemandChargeLast12m);
  
  // Calculate power factor charge if not already provided
  const calculatedPfCharge = pfCharge || calculatePowerFactorCharge(peakKvar, overallPeakKw);
  
  // Calculate base tariff subtotal
  const baseTariffSubtotal = effectiveDemandCharge + energyCharge + calculatedPfCharge + serviceCharge;
  
  // Calculate fuel adjustment charge
  const ftCharge = calculateFTCharge(totalKwh, ftRateSatang);
  
  // Calculate subtotal before VAT
  const subtotalBeforeVat = baseTariffSubtotal + ftCharge;
  
  // Calculate VAT
  const vat = calculateVAT(subtotalBeforeVat);
  
  // Calculate final total
  const grandTotal = subtotalBeforeVat + vat;
  
  const result = {
    calculatedDemandCharge: demandCharge,
    energyCharge,
    effectiveDemandCharge,
    pfCharge: calculatedPfCharge,
    serviceCharge,
    ftCharge,
    subTotal: subtotalBeforeVat,
    vat,
    grandTotal
  };
  
  return formatCalculationResult(result);
};

/**
 * Simple Bill Calculation Utility (for Type 2)
 * Performs simplified bill calculation for small customers
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Simple calculation result
 */
const calculateSimpleBill = (params) => {
  const {
    energyCharge,
    serviceCharge,
    ftRateSatang,
    totalKwh
  } = params;

  // Calculate base tariff
  const baseTariff = energyCharge + serviceCharge;
  
  // Calculate fuel adjustment charge
  const ftCharge = calculateFTCharge(totalKwh, ftRateSatang);
  
  // Calculate VAT
  const vat = calculateVAT(baseTariff + ftCharge);
  
  // Calculate final total
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
};

/**
 * Usage Data Normalization Utility
 * Normalizes usage data from different input formats
 * @param {Object} usage - Raw usage data
 * @param {string} calculationType - Type of calculation
 * @returns {Object} - Normalized usage data
 */
const normalizeUsageData = (usage, calculationType) => {
  const normalized = {};
  
  // Check if usage exists
  if (!usage) {
    return normalized;
  }
  
  // Calculate total energy consumption
  if (usage.total_kwh !== undefined) {
    normalized.totalKwh = usage.total_kwh;
  } else if (usage.on_peak_kwh !== undefined && usage.off_peak_kwh !== undefined) {
    normalized.totalKwh = usage.on_peak_kwh + usage.off_peak_kwh;
    normalized.onPeakKwh = usage.on_peak_kwh;
    normalized.offPeakKwh = usage.off_peak_kwh;
  }
  
  // Calculate overall peak demand for demand-based calculations
  if (['type-3', 'type-4', 'type-5'].includes(calculationType)) {
    if (usage.peak_kw !== undefined) {
      normalized.overallPeakKw = usage.peak_kw;
    } else {
      const demandValues = [];
      if (usage.on_peak_kw !== undefined) demandValues.push(usage.on_peak_kw);
      if (usage.off_peak_kw !== undefined) demandValues.push(usage.off_peak_kw);
      if (usage.partial_peak_kw !== undefined) demandValues.push(usage.partial_peak_kw);
      
      if (demandValues.length > 0) {
        normalized.overallPeakKw = Math.max(...demandValues);
      }
    }
  }
  
  return normalized;
};

module.exports = {
  calculatePowerFactorCharge,
  calculateTieredEnergyCharge,
  calculateVAT,
  calculateFTCharge,
  calculateEffectiveDemandCharge,
  roundToDecimals,
  formatCalculationResult,
  calculateTieredRateCharge,
  calculateTOUCharge,
  calculateTODDemandCharge,
  calculateBasicDemandCharge,
  calculateBasicEnergyCharge,
  calculateServiceCharge,
  calculateCompleteBill,
  calculateSimpleBill,
  normalizeUsageData
};
