/**
 * MEA Electricity Service
 * Handles electricity bill calculations for Metropolitan Electricity Authority (MEA)
 * 
 * This service implements the MEA tariff structure for different customer types:
 * - Type 2: Small General Service (residential and small business)
 * - Type 3: Medium General Service 
 * - Type 4: Large General Service
 * - Type 5: Specific Business Service
 * 
 * Each type supports multiple tariff options:
 * - Normal: Fixed rate structure
 * - Time of Use (TOU): Different rates for peak/off-peak hours
 * - Time of Day (TOD): Three-tier demand pricing (Type 4 only)
 * 
 * Calculations include:
 * - Energy charges (kWh-based)
 * - Demand charges (kW-based, Types 3-5)
 * - Power factor penalties/credits
 * - Service charges
 * - Fuel adjustment charges
 * - 7% VAT
 * 
 * @author BGrimm Energy Platform
 * @version 1.0.0
 */

// MEA Business Constants
// These constants are based on MEA's official tariff structure
const SERVICE_CHARGE = 312.24; // Standard service charge (baht/month) for Types 3-5
const PF_PENALTY_RATE = 56.07; // Power factor penalty rate (baht/kVAR/month)
const PF_THRESHOLD_FACTOR = 0.6197; // Power factor threshold (61.97%)
const MINIMUM_BILL_FACTOR = 0.70; // Minimum bill protection factor (70% of peak demand)
const VAT_RATE = 0.07; // Value Added Tax rate (7%)

// MEA Tariff Rate Tables
// These rates are updated periodically by MEA and should be maintained accordingly
const TYPE_2_RATES = {
  normal: {
    '<12kV': {
      serviceCharge: 33.29,
      energyRates: [
        { threshold: 0, rate: 3.2484 },
        { threshold: 150, rate: 4.2218 },
        { threshold: 400, rate: 4.4217 }
      ]
    },
    '12-24kV': {
      serviceCharge: 312.24,
      energyRate: 3.9086
    }
  },
  tou: {
    '<12kV': {
      serviceCharge: 33.29,
      onPeakRate: 5.7982,
      offPeakRate: 2.6369
    },
    '12-24kV': {
      serviceCharge: 312.24,
      onPeakRate: 5.1135,
      offPeakRate: 2.6037
    }
  }
};

const TYPE_3_RATES = {
  normal: {
    '>=69kV': { demand: 175.70, energy: 3.1097 },
    '12-24kV': { demand: 196.26, energy: 3.1271 },
    '<12kV': { demand: 221.50, energy: 3.1751 }
  },
  tou: {
    '>=69kV': { demand_on: 74.14, energy_on: 4.1025, energy_off: 2.5849 },
    '12-24kV': { demand_on: 132.93, energy_on: 4.1839, energy_off: 2.6037 },
    '<12kV': { demand_on: 210.80, energy_on: 4.5297, energy_off: 2.6369 }
  }
};

const TYPE_4_RATES = {
  tod: {
    '>=69kV': { demand_on: 280.00, demand_partial: 74.14, demand_off: 0, energy: 3.1097 },
    '12-24kV': { demand_on: 334.33, demand_partial: 132.93, demand_off: 0, energy: 3.1271 },
    '<12kV': { demand_on: 352.71, demand_partial: 210.80, demand_off: 0, energy: 3.1751 }
  },
  tou: {
    '>=69kV': { demand_on: 74.14, energy_on: 4.1025, energy_off: 2.5849 },
    '12-24kV': { demand_on: 132.93, energy_on: 4.1839, energy_off: 2.6037 },
    '<12kV': { demand_on: 210.80, energy_on: 4.5297, energy_off: 2.6369 }
  }
};

const TYPE_5_RATES = {
  normal: {
    '>=69kV': { demand: 220.36, energy: 3.1097 },
    '12-24kV': { demand: 256.07, energy: 3.1271 },
    '<12kV': { demand: 276.64, energy: 3.1751 }
  },
  tou: {
    '>=69kV': { demand_on: 74.14, energy_on: 4.1025, energy_off: 2.5849 },
    '12-24kV': { demand_on: 132.93, energy_on: 4.1839, energy_off: 2.6037 },
    '<12kV': { demand_on: 210.80, energy_on: 4.5297, energy_off: 2.6369 }
  }
};

// Helper functions
/**
 * Calculates energy charge for Type 2 (Small General Service) customers
 * Implements tiered rate structure for <12kV and flat rate for 12-24kV
 * 
 * @param {number} totalKwh - Total energy consumption in kWh
 * @param {string} voltageLevel - Voltage level ('<12kV' or '12-24kV')
 * @returns {number} Energy charge in baht
 * 
 * Rate Structure:
 * <12kV: Tiered rates (0-150, 151-400, 401+ kWh)
 * 12-24kV: Flat rate for all consumption
 */
const calculateEnergyChargeType2 = (totalKwh, voltageLevel) => {
  if (voltageLevel === '12-24kV') {
    return totalKwh * TYPE_2_RATES.normal['12-24kV'].energyRate;
  } else {
    let energyCharge = 0;
    let remainingKwh = totalKwh;
    
    const rates = TYPE_2_RATES.normal['<12kV'].energyRates;
    
    // Calculate tiered rates from highest to lowest
    if (remainingKwh > 400) {
      energyCharge += (remainingKwh - 400) * 4.4217;
      remainingKwh = 400;
    }
    if (remainingKwh > 150) {
      energyCharge += (remainingKwh - 150) * 4.2218;
      remainingKwh = 150;
    }
    if (remainingKwh > 0) {
      energyCharge += remainingKwh * 3.2484;
    }
    
    return energyCharge;
  }
};

/**
 * Calculates power factor penalty charge
 * Applied when reactive power exceeds 61.97% of active power
 * 
 * @param {number} peakKvar - Peak reactive power in kVAR
 * @param {number} overallPeakKw - Overall peak active power in kW
 * @returns {number} Power factor charge in baht (0 if no penalty)
 * 
 * Formula: max(0, kVAR - (kW * 0.6197)) * penalty_rate
 */
const calculatePowerFactorCharge = (peakKvar, overallPeakKw) => {
  const excessKvar = Math.max(0, peakKvar - (overallPeakKw * PF_THRESHOLD_FACTOR));
  return Math.round(excessKvar) * PF_PENALTY_RATE;
};

// Type 2 calculation functions
/**
 * Calculates bill for Type 2 Normal tariff
 * Small General Service with standard rate structure
 * 
 * @param {Object} data - Input data
 * @param {string} data.voltageLevel - Voltage level
 * @param {number} data.ftRateSatang - Fuel adjustment rate in satang/kWh
 * @param {Object} data.usage - Usage data
 * @param {number} data.usage.total_kwh - Total energy consumption
 * @returns {Object} Calculation results
 */
const _calculateType2Normal = (data) => {
  const { voltageLevel, ftRateSatang, usage } = data;
  const { total_kwh } = usage;
  
  const serviceCharge = voltageLevel === '12-24kV' 
    ? TYPE_2_RATES.normal['12-24kV'].serviceCharge 
    : TYPE_2_RATES.normal['<12kV'].serviceCharge;
  
  const energyCharge = calculateEnergyChargeType2(total_kwh, voltageLevel);
  const baseTariff = energyCharge + serviceCharge;
  const ftCharge = total_kwh * (ftRateSatang / 100);
  const vat = (baseTariff + ftCharge) * VAT_RATE;
  const totalBill = baseTariff + ftCharge + vat;
  
  return {
    energyCharge: Math.round(energyCharge * 1000) / 1000,
    serviceCharge,
    baseTariff: Math.round(baseTariff * 1000) / 1000,
    ftCharge: Math.round(ftCharge * 1000) / 1000,
    vat: Math.round(vat * 100000) / 100000,
    totalBill: Math.round(totalBill * 100000) / 100000
  };
};

/**
 * Calculates bill for Type 2 Time of Use tariff
 * Different rates for peak and off-peak hours
 * 
 * @param {Object} data - Input data
 * @param {string} data.voltageLevel - Voltage level
 * @param {number} data.ftRateSatang - Fuel adjustment rate
 * @param {Object} data.usage - Usage data with peak/off-peak breakdown
 * @returns {Object} Calculation results
 */
const _calculateType2Tou = (data) => {
  const { voltageLevel, ftRateSatang, usage } = data;
  const { on_peak_kwh, off_peak_kwh } = usage;
  
  const rates = TYPE_2_RATES.tou[voltageLevel];
  const serviceCharge = rates.serviceCharge;
  const energyCharge = (on_peak_kwh * rates.onPeakRate) + (off_peak_kwh * rates.offPeakRate);
  const totalKwh = on_peak_kwh + off_peak_kwh;
  const baseTariff = energyCharge + serviceCharge;
  const ftCharge = totalKwh * (ftRateSatang / 100);
  const vat = (baseTariff + ftCharge) * VAT_RATE;
  const totalBill = baseTariff + ftCharge + vat;
  
  return {
    energyCharge: Math.round(energyCharge * 1000) / 1000,
    serviceCharge,
    baseTariff: Math.round(baseTariff * 1000) / 1000,
    ftCharge: Math.round(ftCharge * 1000) / 1000,
    vat: Math.round(vat * 100000) / 100000,
    totalBill: Math.round(totalBill * 100000) / 100000
  };
};

// Type 3 calculation function
/**
 * Calculates bill for Type 3 Medium General Service
 * Includes demand charges and power factor calculations
 * 
 * @param {Object} data - Input data
 * @param {string} data.tariffType - 'normal' or 'tou'
 * @param {string} data.voltageLevel - Voltage level
 * @param {number} data.peakKvar - Peak reactive power
 * @param {number} data.highestDemandChargeLast12m - Historical demand charge
 * @param {Object} data.usage - Usage data
 * @returns {Object} Calculation results with demand charges
 */
const _calculateType3 = (data) => {
  const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
  const rates = TYPE_3_RATES[tariffType][voltageLevel];
  
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
  
  const minimumCharge = highestDemandChargeLast12m * MINIMUM_BILL_FACTOR;
  const effectiveDemandCharge = Math.max(calculatedDemandCharge, minimumCharge);
  const pfCharge = calculatePowerFactorCharge(peakKvar, overallPeakKw);
  const totalBaseTariff = effectiveDemandCharge + energyCharge + pfCharge + SERVICE_CHARGE;
  const ftCharge = totalKwhForFt * (ftRateSatang / 100);
  const subTotal = totalBaseTariff + ftCharge;
  const vat = subTotal * VAT_RATE;
  const grandTotal = subTotal + vat;
  
  return {
    calculatedDemandCharge: Math.round(calculatedDemandCharge * 10) / 10,
    energyCharge: Math.round(energyCharge * 10) / 10,
    effectiveDemandCharge: Math.round(effectiveDemandCharge * 10) / 10,
    pfCharge: Math.round(pfCharge * 1000) / 1000,
    serviceCharge: SERVICE_CHARGE,
    ftCharge: Math.round(ftCharge * 10) / 10,
    subTotal: Math.round(subTotal * 1000) / 1000,
    vat: Math.round(vat * 100000) / 100000,
    grandTotal: Math.round(grandTotal * 100000) / 100000
  };
};

// Type 4 calculation function
/**
 * Calculates bill for Type 4 Large General Service
 * Supports both TOD (Time of Day) and TOU tariffs
 * 
 * @param {Object} data - Input data
 * @param {string} data.tariffType - 'tod' or 'tou'
 * @param {string} data.voltageLevel - Voltage level
 * @param {number} data.peakKvar - Peak reactive power
 * @param {number} data.highestDemandChargeLast12m - Historical demand charge
 * @param {Object} data.usage - Usage data (varies by tariff type)
 * @returns {Object} Calculation results
 */
const _calculateType4 = (data) => {
  const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
  const rates = TYPE_4_RATES[tariffType][voltageLevel];
  
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
  
  const minimumCharge = highestDemandChargeLast12m * MINIMUM_BILL_FACTOR;
  const effectiveDemandCharge = Math.max(calculatedDemandCharge, minimumCharge);
  const pfCharge = calculatePowerFactorCharge(peakKvar, overallPeakKw);
  const totalBaseTariff = effectiveDemandCharge + energyCharge + pfCharge + SERVICE_CHARGE;
  const ftCharge = totalKwhForFt * (ftRateSatang / 100);
  const subTotal = totalBaseTariff + ftCharge;
  const vat = subTotal * VAT_RATE;
  const grandTotal = subTotal + vat;
  
  return {
    calculatedDemandCharge: Math.round(calculatedDemandCharge * 10) / 10,
    energyCharge: Math.round(energyCharge * 10) / 10,
    effectiveDemandCharge: Math.round(effectiveDemandCharge * 10) / 10,
    pfCharge: Math.round(pfCharge * 1000) / 1000,
    serviceCharge: SERVICE_CHARGE,
    ftCharge: Math.round(ftCharge * 10) / 10,
    subTotal: Math.round(subTotal * 1000) / 1000,
    vat: Math.round(vat * 100000) / 100000,
    grandTotal: Math.round(grandTotal * 100000) / 100000
  };
};

// Type 5 calculation function
/**
 * Calculates bill for Type 5 Specific Business Service
 * Similar to Type 3 but with different rate structure
 * 
 * @param {Object} data - Input data
 * @param {string} data.tariffType - 'normal' or 'tou'
 * @param {string} data.voltageLevel - Voltage level
 * @param {number} data.peakKvar - Peak reactive power
 * @param {number} data.highestDemandChargeLast12m - Historical demand charge
 * @param {Object} data.usage - Usage data
 * @returns {Object} Calculation results
 */
const _calculateType5 = (data) => {
  const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
  const rates = TYPE_5_RATES[tariffType][voltageLevel];
  
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
  
  const minimumCharge = highestDemandChargeLast12m * MINIMUM_BILL_FACTOR;
  const effectiveDemandCharge = Math.max(calculatedDemandCharge, minimumCharge);
  const pfCharge = calculatePowerFactorCharge(peakKvar, overallPeakKw);
  const totalBaseTariff = effectiveDemandCharge + energyCharge + pfCharge + SERVICE_CHARGE;
  const ftCharge = totalKwhForFt * (ftRateSatang / 100);
  const subTotal = totalBaseTariff + ftCharge;
  const vat = subTotal * VAT_RATE;
  const grandTotal = subTotal + vat;
  
  return {
    calculatedDemandCharge: Math.round(calculatedDemandCharge * 10) / 10,
    energyCharge: Math.round(energyCharge * 10) / 10,
    effectiveDemandCharge: Math.round(effectiveDemandCharge * 10) / 10,
    pfCharge: Math.round(pfCharge * 1000) / 1000,
    serviceCharge: SERVICE_CHARGE,
    ftCharge: Math.round(ftCharge * 10) / 10,
    subTotal: Math.round(subTotal * 1000) / 1000,
    vat: Math.round(vat * 100000) / 100000,
    grandTotal: Math.round(grandTotal * 100000) / 100000
  };
};

// Main dispatcher function
/**
 * Main calculation entry point
 * Routes to appropriate calculation function based on customer type
 * 
 * @param {string} calculationType - Customer type ('type-2', 'type-3', 'type-4', 'type-5')
 * @param {Object} data - Input data for calculation
 * @returns {Object} Complete bill calculation results
 * 
 * @throws {Error} If calculation type is invalid or calculation fails
 * 
 * @example
 * const result = calculateBill('type-2', {
 *   tariffType: 'normal',
 *   voltageLevel: '<12kV',
 *   ftRateSatang: 19.72,
 *   usage: { total_kwh: 500 }
 * });
 */
const calculateBill = (calculationType, data) => {
  // Try to get result from cache first
  const cacheKey = cache.generateKey(calculationType, data);
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    logger.debug('Cache hit for calculation', { calculationType });
    return { ...cachedResult, cached: true };
  }
  
  let result;
  
  try {
    switch (calculationType) {
      case 'type-2':
        if (data.tariffType === 'normal') {
          result = _calculateType2Normal(data);
        } else if (data.tariffType === 'tou') {
          result = _calculateType2Tou(data);
        } else {
          throw new Error('Invalid tariff type for Type 2. Must be "normal" or "tou"');
        }
        break;
      case 'type-3':
        result = _calculateType3(data);
        break;
      case 'type-4':
        result = _calculateType4(data);
        break;
      case 'type-5':
        result = _calculateType5(data);
        break;
      default:
        throw new Error(`Invalid calculation type: ${calculationType}`);
    }
    
    // Cache the result
    cache.set(cacheKey, result);
    logger.debug('Cached calculation result', { calculationType });
    
    return result;
    
  } catch (error) {
    logger.error('Calculation failed', {
      calculationType,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  calculateBill
};
