/**
 * Shared Calculation Helpers
 * Common calculation functions used across MEA and PEA services
 */

const { VAT_RATE, PF_PENALTY_RATE, PF_THRESHOLD_FACTOR, MINIMUM_BILL_FACTOR } = require('./constants');

/**
 * Calculates power factor charge
 * @param {number} peakKvar - Peak kVAR
 * @param {number} overallPeakKw - Overall peak kW
 * @returns {number} - Power factor charge
 */
const calculatePowerFactorCharge = (peakKvar, overallPeakKw) => {
  const excessKvar = Math.max(0, peakKvar - (overallPeakKw * PF_THRESHOLD_FACTOR));
  return Math.round(excessKvar) * PF_PENALTY_RATE;
};

/**
 * Calculates tiered energy charge for Type 2
 * @param {number} totalKwh - Total kWh consumption
 * @param {Array} energyRates - Array of tiered rates
 * @returns {number} - Energy charge
 */
const calculateTieredEnergyCharge = (totalKwh, energyRates) => {
  let energyCharge = 0;
  let remainingKwh = totalKwh;
  
  // Sort rates by threshold in descending order
  const sortedRates = [...energyRates].sort((a, b) => b.threshold - a.threshold);
  
  for (let i = 0; i < sortedRates.length; i++) {
    const rate = sortedRates[i];
    const nextThreshold = i < sortedRates.length - 1 ? sortedRates[i + 1].threshold : 0;
    
    if (remainingKwh > rate.threshold) {
      const kwhInThisTier = remainingKwh - Math.max(rate.threshold, nextThreshold);
      energyCharge += kwhInThisTier * rate.rate;
      remainingKwh = Math.max(rate.threshold, nextThreshold);
    }
  }
  
  return energyCharge;
};

/**
 * Calculates VAT
 * @param {number} baseAmount - Base amount before VAT
 * @returns {number} - VAT amount
 */
const calculateVAT = (baseAmount) => {
  return baseAmount * VAT_RATE;
};

/**
 * Calculates FT charge
 * @param {number} totalKwh - Total kWh for FT calculation
 * @param {number} ftRateSatang - FT rate in satang
 * @returns {number} - FT charge
 */
const calculateFTCharge = (totalKwh, ftRateSatang) => {
  return totalKwh * (ftRateSatang / 100);
};

/**
 * Calculates effective demand charge with minimum bill factor
 * @param {number} calculatedDemandCharge - Calculated demand charge
 * @param {number} highestDemandChargeLast12m - Highest demand charge in last 12 months
 * @returns {number} - Effective demand charge
 */
const calculateEffectiveDemandCharge = (calculatedDemandCharge, highestDemandChargeLast12m) => {
  const minimumCharge = highestDemandChargeLast12m * MINIMUM_BILL_FACTOR;
  return Math.max(calculatedDemandCharge, minimumCharge);
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
 * Formats calculation result with consistent rounding
 * @param {Object} result - Raw calculation result
 * @returns {Object} - Formatted result with proper rounding
 */
const formatCalculationResult = (result) => {
  const formatted = {};
  
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'number') {
      // Apply different rounding based on field type and original implementation
      if (key === 'energyCharge' || key === 'baseTariff' || key === 'ftCharge') {
        formatted[key] = roundToDecimals(value, 3);
      } else if (key === 'vat' || key === 'totalBill' || key === 'grandTotal') {
        formatted[key] = roundToDecimals(value, 5);
      } else if (key === 'calculatedDemandCharge' || key === 'effectiveDemandCharge' || key === 'ftCharge') {
        formatted[key] = roundToDecimals(value, 1);
      } else if (key === 'pfCharge') {
        formatted[key] = roundToDecimals(value, 3);
      } else if (key === 'subTotal') {
        formatted[key] = roundToDecimals(value, 3);
      } else {
        formatted[key] = value;
      }
    } else {
      formatted[key] = value;
    }
  }
  
  return formatted;
};

module.exports = {
  calculatePowerFactorCharge,
  calculateTieredEnergyCharge,
  calculateVAT,
  calculateFTCharge,
  calculateEffectiveDemandCharge,
  roundToDecimals,
  formatCalculationResult
};
