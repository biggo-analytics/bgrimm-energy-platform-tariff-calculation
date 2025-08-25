/**
 * Shared Calculation Helpers
 * Common calculation functions used across MEA and PEA services
 */

const { VAT_RATE, PF_PENALTY_RATE, PF_THRESHOLD_FACTOR, MINIMUM_BILL_FACTOR } = require('./constants');

/**
 * Calculates power factor penalty charge when reactive power exceeds threshold
 * 
 * Power factor penalty is applied when the reactive power (kVAR) exceeds 61.97% 
 * of the active power (kW). This encourages customers to maintain good power factor.
 * 
 * @param {number} peakReactivePowerKvar - Peak reactive power in kVAR
 * @param {number} overallPeakActivePowerKw - Overall peak active power in kW
 * @returns {number} - Power factor penalty charge in Baht
 * 
 * @example
 * // Customer with 100 kVAR and 150 kW
 * // Threshold = 150 * 0.6197 = 92.955 kVAR
 * // Excess = 100 - 92.955 = 7.045 kVAR (rounded to 7)
 * // Penalty = 7 * 56.07 = 392.49 Baht
 * calculatePowerFactorCharge(100, 150); // Returns 392.49
 */
const calculatePowerFactorCharge = (peakReactivePowerKvar, overallPeakActivePowerKw) => {
  // Calculate the maximum allowed reactive power based on power factor threshold (61.97%)
  const allowedReactivePowerKvar = overallPeakActivePowerKw * PF_THRESHOLD_FACTOR;
  
  // Calculate excess reactive power that exceeds the threshold
  const excessReactivePowerKvar = Math.max(0, peakReactivePowerKvar - allowedReactivePowerKvar);
  
  // Round excess kVAR to nearest integer and apply penalty rate
  const roundedExcessKvar = Math.round(excessReactivePowerKvar);
  const powerFactorPenaltyCharge = roundedExcessKvar * PF_PENALTY_RATE;
  
  return powerFactorPenaltyCharge;
};

/**
 * Calculates tiered energy charge for Type 2 customers using progressive rate structure
 * 
 * Type 2 customers with voltage <12kV use a tiered rate system where higher consumption
 * is charged at higher rates. This function processes consumption from highest tier
 * down to encourage energy conservation.
 * 
 * Typical tier structure:
 * - Tier 1: 0-150 kWh at base rate
 * - Tier 2: 151-400 kWh at medium rate  
 * - Tier 3: 401+ kWh at highest rate
 * 
 * @param {number} totalEnergyConsumptionKwh - Total energy consumption in kWh
 * @param {Array} tieredEnergyRates - Array of rate objects with {threshold, rate} structure
 * @returns {number} - Total energy charge in Baht
 * 
 * @example
 * const rates = [
 *   { threshold: 0, rate: 3.2484 },
 *   { threshold: 150, rate: 4.2218 },
 *   { threshold: 400, rate: 4.4217 }
 * ];
 * calculateTieredEnergyCharge(500, rates); // Calculates charge for 500 kWh
 */
const calculateTieredEnergyCharge = (totalEnergyConsumptionKwh, tieredEnergyRates) => {
  let totalEnergyCharge = 0;
  let remainingConsumptionKwh = totalEnergyConsumptionKwh;
  
  // Sort rates by threshold in descending order (highest tier first)
  // This allows us to process from top tier down for easier calculation
  const ratesSortedByThresholdDesc = [...tieredEnergyRates].sort((a, b) => b.threshold - a.threshold);
  
  // Process each tier from highest to lowest
  for (let tierIndex = 0; tierIndex < ratesSortedByThresholdDesc.length; tierIndex++) {
    const currentTierRate = ratesSortedByThresholdDesc[tierIndex];
    const nextTierThreshold = tierIndex < ratesSortedByThresholdDesc.length - 1 
      ? ratesSortedByThresholdDesc[tierIndex + 1].threshold 
      : 0;
    
    // Calculate consumption in this tier if any remaining consumption exceeds the threshold
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
 * 
 * VAT is applied at 7% rate on the total of base tariff plus fuel adjustment charge
 * as per Thai tax regulations for electricity services.
 * 
 * @param {number} taxableAmountBeforeVat - Base amount subject to VAT in Baht
 * @returns {number} - VAT amount in Baht (7% of base amount)
 * 
 * @example
 * // Base amount of 1000 Baht
 * // VAT = 1000 * 0.07 = 70 Baht
 * calculateVAT(1000); // Returns 70
 */
const calculateVAT = (taxableAmountBeforeVat) => {
  const vatAmount = taxableAmountBeforeVat * VAT_RATE;
  return vatAmount;
};

/**
 * Calculates Fuel Adjustment (FT) charge based on energy consumption
 * 
 * The FT charge adjusts electricity bills based on fuel cost fluctuations
 * that affect power generation. The rate is set monthly by the regulatory
 * authority and applied to all energy consumption.
 * 
 * @param {number} totalEnergyConsumptionKwh - Total energy consumption in kWh
 * @param {number} fuelAdjustmentRateSatang - FT rate in satang per kWh (1/100 of Baht)
 * @returns {number} - Fuel adjustment charge in Baht
 * 
 * @example
 * // 1000 kWh consumption with FT rate of 19.72 satang/kWh
 * // FT charge = 1000 * (19.72 / 100) = 197.2 Baht
 * calculateFTCharge(1000, 19.72); // Returns 197.2
 */
const calculateFTCharge = (totalEnergyConsumptionKwh, fuelAdjustmentRateSatang) => {
  // Convert satang to Baht (divide by 100) and multiply by consumption
  const fuelAdjustmentRateBaht = fuelAdjustmentRateSatang / 100;
  const fuelAdjustmentCharge = totalEnergyConsumptionKwh * fuelAdjustmentRateBaht;
  
  return fuelAdjustmentCharge;
};

/**
 * Calculates effective demand charge with minimum bill protection
 * 
 * The effective demand charge protects customers from seasonal variations by ensuring
 * the demand charge never falls below 70% of the highest demand charge in the last
 * 12 months. This provides billing stability and protects utility revenue.
 * 
 * @param {number} currentMonthDemandCharge - Demand charge calculated for current month in Baht
 * @param {number} historicalPeakDemandCharge - Highest demand charge in last 12 months in Baht
 * @returns {number} - Effective demand charge (higher of current or 70% of historical peak) in Baht
 * 
 * @example
 * // Current month: 1000 Baht, Historical peak: 2000 Baht
 * // Minimum charge = 2000 * 0.70 = 1400 Baht
 * // Effective charge = max(1000, 1400) = 1400 Baht
 * calculateEffectiveDemandCharge(1000, 2000); // Returns 1400
 */
const calculateEffectiveDemandCharge = (currentMonthDemandCharge, historicalPeakDemandCharge) => {
  // Calculate minimum charge as 70% of historical peak (minimum bill protection)
  const minimumDemandChargeBasedOnHistory = historicalPeakDemandCharge * MINIMUM_BILL_FACTOR;
  
  // Return the higher of current month's demand charge or the minimum based on history
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
 * 
 * Different billing components require different precision levels based on regulatory
 * requirements and business practices. This function applies the appropriate rounding
 * to each component type.
 * 
 * Precision Rules:
 * - Energy charges, base tariff: 3 decimal places (0.001 Baht precision)
 * - VAT, final totals: 5 decimal places (0.00001 Baht precision for tax accuracy)
 * - Demand charges: 1 decimal place (0.1 Baht precision for large amounts)
 * - Power factor charges: 3 decimal places (penalty calculation precision)
 * - Service charges: No rounding (fixed amounts)
 * 
 * @param {Object} rawCalculationResult - Unformatted calculation result with numeric values
 * @returns {Object} - Formatted result with appropriate precision for each field
 */
const formatCalculationResult = (rawCalculationResult) => {
  const formattedResult = {};
  
  // Define precision rules for different types of billing components
  const PRECISION_RULES = {
    // Standard billing components (3 decimal places)
    STANDARD_BILLING_PRECISION: ['energyCharge', 'baseTariff', 'subTotal', 'pfCharge'],
    // Final amounts requiring high precision (5 decimal places for tax compliance)
    HIGH_PRECISION_FINAL_AMOUNTS: ['vat', 'totalBill', 'grandTotal'],
    // Large demand charges (1 decimal place)
    DEMAND_CHARGE_PRECISION: ['calculatedDemandCharge', 'effectiveDemandCharge'],
    // FT charges (1 decimal place due to calculation method)
    FT_CHARGE_PRECISION: ['ftCharge']
  };
  
  // Process each field in the result
  for (const [fieldName, fieldValue] of Object.entries(rawCalculationResult)) {
    if (typeof fieldValue === 'number') {
      // Apply appropriate rounding based on field type
      if (PRECISION_RULES.STANDARD_BILLING_PRECISION.includes(fieldName)) {
        formattedResult[fieldName] = roundToDecimals(fieldValue, 3);
      } else if (PRECISION_RULES.HIGH_PRECISION_FINAL_AMOUNTS.includes(fieldName)) {
        formattedResult[fieldName] = roundToDecimals(fieldValue, 5);
      } else if (PRECISION_RULES.DEMAND_CHARGE_PRECISION.includes(fieldName)) {
        formattedResult[fieldName] = roundToDecimals(fieldValue, 1);
      } else if (PRECISION_RULES.FT_CHARGE_PRECISION.includes(fieldName)) {
        formattedResult[fieldName] = roundToDecimals(fieldValue, 1);
      } else {
        // Default: keep original value (e.g., service charges are fixed amounts)
        formattedResult[fieldName] = fieldValue;
      }
    } else {
      // Non-numeric values (strings, objects, etc.) are preserved as-is
      formattedResult[fieldName] = fieldValue;
    }
  }
  
  return formattedResult;
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
