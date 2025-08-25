/**
 * PEA Electricity Controller
 * Handles PEA electricity bill calculation requests
 */

// Constants
const VAT_RATE = 0.07;
const PF_PENALTY_RATE = 56.07;
const PF_THRESHOLD_FACTOR = 0.6197;
const MINIMUM_BILL_FACTOR = 0.70;

// PEA Rate tables
const PEA_TYPE_2_RATES = {
  // Normal Tariff Rates
  normal: {
    // Corresponds to 'แรงดันต่ำกว่า 22 กิโลโวลต์' (Voltage lower than 22 kV)
    '<22kV': {
      serviceCharge: 33.29,
      energyRates: [
        { threshold: 0, rate: 3.2484 },   // Rate for the first 150 kWh
        { threshold: 150, rate: 4.2218 }, // Rate for the next 250 kWh (i.e., from 151 to 400 kWh)
        { threshold: 400, rate: 4.4217 }  // Rate for all units over 400 kWh
      ]
    },
    // Corresponds to 'แรงดัน 22 – 33 กิโลโวลต์' (Voltage 22 - 33 kV)
    '22-33kV': {
      serviceCharge: 312.24,
      energyRate: 3.9086 // A single, flat rate for all energy consumption
    }
  },
  // Time of Use (TOU) Tariff Rates
  tou: {
    // Corresponds to 'แรงดันต่ำกว่า 22 กิโลโวลต์' (Voltage lower than 22 kV)
    '<22kV': {
      serviceCharge: 33.29,
      onPeakRate: 5.7982,
      offPeakRate: 2.6369
    },
    // Corresponds to 'แรงดัน 22 – 33 กิโลโวลต์' (Voltage 22 - 33 kV)
    '22-33kV': {
      serviceCharge: 312.24,
      onPeakRate: 5.1135,
      offPeakRate: 2.6037
    }
  }
};

const PEA_TYPE_3_RATES = {
  // Normal Tariff Rates
  normal: {
    // Corresponds to 'แรงดันตั้งแต่ 69 กิโลโวลต์ขึ้นไป'
    '>=69kV': {
      demand: 175.70,
      energy: 3.1097,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดัน 22 – 33 กิโลโวลต์'
    '22-33kV': {
      demand: 196.26,
      energy: 3.1471,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดันต่ำกว่า 22 กิโลโวลต์'
    '<22kV': {
      demand: 221.50,
      energy: 3.1751,
      serviceCharge: 312.24
    }
  },
  // Time of Use (TOU) Tariff Rates
  tou: {
    // Corresponds to 'แรงดันตั้งแต่ 69 กิโลโวลต์ขึ้นไป'
    '>=69kV': {
      demand_on: 74.14,
      energy_on: 4.1025,
      energy_off: 2.5849,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดัน 22 – 33 กิโลโวลต์'
    '22-33kV': {
      demand_on: 132.93,
      energy_on: 4.1839,
      energy_off: 2.6037,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดันต่ำกว่า 22 กิโลโวลต์'
    '<22kV': {
      demand_on: 210.00, // Note: Corrected from image
      energy_on: 4.3297, // Note: Corrected from image
      energy_off: 2.6369,
      serviceCharge: 312.24
    }
  }
};

const PEA_TYPE_4_RATES = {
  // Time of Day (TOD) Tariff Rates
  tod: {
    // Corresponds to 'แรงดันตั้งแต่ 69 กิโลโวลต์ขึ้นไป'
    '>=69kV': {
      demand_on: 224.30,
      demand_partial: 29.91,
      demand_off: 0,
      energy: 3.1097,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดัน 22 – 33 กิโลโวลต์'
    '22-33kV': {
      demand_on: 285.05,
      demand_partial: 58.88,
      demand_off: 0,
      energy: 3.1471,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดันต่ำกว่า 22 กิโลโวลต์'
    '<22kV': {
      demand_on: 332.71,
      demand_partial: 68.22,
      demand_off: 0,
      energy: 3.1751,
      serviceCharge: 312.24
    }
  },
  // Time of Use (TOU) Tariff Rates
  tou: {
    // Corresponds to 'แรงดันตั้งแต่ 69 กิโลโวลต์ขึ้นไป'
    '>=69kV': {
      demand_on: 74.14,
      energy_on: 4.1025,
      energy_off: 2.5849,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดัน 22 – 33 กิโลโวลต์'
    '22-33kV': {
      demand_on: 132.93,
      energy_on: 4.1839,
      energy_off: 2.6037,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดันต่ำกว่า 22 กิโลโวลต์'
    '<22kV': {
      demand_on: 210.00,
      energy_on: 4.3297,
      energy_off: 2.6369,
      serviceCharge: 312.24
    }
  }
};

const PEA_TYPE_5_RATES = {
  // Corresponds to 'อัตราสำหรับผู้ใช้ไฟฟ้าที่ยังไม่ได้ติดตั้งมิเตอร์ TOU' (Normal rates)
  normal: {
    // Corresponds to 'แรงดันตั้งแต่ 69 กิโลโวลต์ขึ้นไป'
    '>=69kV': {
      demand: 220.56,
      energy: 3.1097,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดัน 22 – 33 กิโลโวลต์'
    '22-33kV': {
      demand: 256.07,
      energy: 3.1471,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดันต่ำกว่า 22 กิโลโวลต์'
    '<22kV': {
      demand: 276.64,
      energy: 3.1751,
      serviceCharge: 312.24
    }
  },
  // Corresponds to 'อัตราตามช่วงเวลาของการใช้ (Time of Use Rate : TOU)'
  tou: {
    // Corresponds to 'แรงดันตั้งแต่ 69 กิโลโวลต์ขึ้นไป'
    '>=69kV': {
      demand_on: 74.14,
      energy_on: 4.1025,
      energy_off: 2.5849,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดัน 22 – 33 กิโลโวลต์'
    '22-33kV': {
      demand_on: 132.93,
      energy_on: 4.1839,
      energy_off: 2.6037,
      serviceCharge: 312.24
    },
    // Corresponds to 'แรงดันต่ำกว่า 22 กิโลโวลต์'
    '<22kV': {
      demand_on: 210.00,
      energy_on: 4.3297,
      energy_off: 2.6369,
      serviceCharge: 312.24
    }
  }
};

// Input validation helper
const validateCalculationInput = (ctx, requiredFields) => {
  const { body } = ctx.request;
  
  if (!body) {
    ctx.status = 400;
    ctx.body = { error: 'Request body is required' };
    return false;
  }

  for (const field of requiredFields) {
    if (!body[field]) {
      ctx.status = 400;
      ctx.body = { error: `Missing required field: ${field}` };
      return false;
    }
  }

  return true;
};

// Helper functions
const calculatePowerFactorCharge = (peakKvar, overallPeakKw) => {
  const excessKvar = Math.max(0, peakKvar - (overallPeakKw * PF_THRESHOLD_FACTOR));
  return Math.round(excessKvar) * PF_PENALTY_RATE;
};

const calculateEnergyChargeType2 = (totalKwh, voltageLevel) => {
  if (voltageLevel === '22-33kV') {
    return totalKwh * PEA_TYPE_2_RATES.normal['22-33kV'].energyRate;
  } else {
    let energyCharge = 0;
    let remainingKwh = totalKwh;
    
    const rates = PEA_TYPE_2_RATES.normal['<22kV'].energyRates;
    
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

// Type 2 calculation functions
const _calculateType2Normal = (data) => {
  const { voltageLevel, ftRateSatang, usage } = data;
  const { total_kwh } = usage;
  
  const serviceCharge = voltageLevel === '22-33kV' 
    ? PEA_TYPE_2_RATES.normal['22-33kV'].serviceCharge 
    : PEA_TYPE_2_RATES.normal['<22kV'].serviceCharge;
  
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

const _calculateType2Tou = (data) => {
  const { voltageLevel, ftRateSatang, usage } = data;
  const { on_peak_kwh, off_peak_kwh } = usage;
  
  const rates = PEA_TYPE_2_RATES.tou[voltageLevel];
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
const _calculateType3 = (data) => {
  const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
  const rates = PEA_TYPE_3_RATES[tariffType][voltageLevel];
  
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
  const totalBaseTariff = effectiveDemandCharge + energyCharge + pfCharge + rates.serviceCharge;
  const ftCharge = totalKwhForFt * (ftRateSatang / 100);
  const subTotal = totalBaseTariff + ftCharge;
  const vat = subTotal * VAT_RATE;
  const grandTotal = subTotal + vat;
  
  return {
    calculatedDemandCharge: Math.round(calculatedDemandCharge * 10) / 10,
    energyCharge: Math.round(energyCharge * 10) / 10,
    effectiveDemandCharge: Math.round(effectiveDemandCharge * 10) / 10,
    pfCharge: Math.round(pfCharge * 1000) / 1000,
    serviceCharge: rates.serviceCharge,
    ftCharge: Math.round(ftCharge * 10) / 10,
    subTotal: Math.round(subTotal * 1000) / 1000,
    vat: Math.round(vat * 100000) / 100000,
    grandTotal: Math.round(grandTotal * 100000) / 100000
  };
};

// Type 4 calculation function
const _calculateType4 = (data) => {
  const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
  
  // Validate tariff type
  if (!PEA_TYPE_4_RATES[tariffType]) {
    throw new Error(`Invalid tariff type for Type 4. Must be "tod" or "tou", received: ${tariffType}`);
  }
  
  // Validate voltage level
  if (!PEA_TYPE_4_RATES[tariffType][voltageLevel]) {
    throw new Error(`Invalid voltage level for Type 4 ${tariffType}. Must be ">=69kV", "22-33kV", or "<22kV", received: ${voltageLevel}`);
  }
  
  const rates = PEA_TYPE_4_RATES[tariffType][voltageLevel];
  
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
  const totalBaseTariff = effectiveDemandCharge + energyCharge + pfCharge + rates.serviceCharge;
  const ftCharge = totalKwhForFt * (ftRateSatang / 100);
  const subTotal = totalBaseTariff + ftCharge;
  const vat = subTotal * VAT_RATE;
  const grandTotal = subTotal + vat;
  
  return {
    calculatedDemandCharge: Math.round(calculatedDemandCharge * 10) / 10,
    energyCharge: Math.round(energyCharge * 10) / 10,
    effectiveDemandCharge: Math.round(effectiveDemandCharge * 10) / 10,
    pfCharge: Math.round(pfCharge * 1000) / 1000,
    serviceCharge: rates.serviceCharge,
    ftCharge: Math.round(ftCharge * 10) / 10,
    subTotal: Math.round(subTotal * 1000) / 1000,
    vat: Math.round(vat * 100000) / 100000,
    grandTotal: Math.round(grandTotal * 100000) / 100000
  };
};

// Type 5 calculation function
const _calculateType5 = (data) => {
  const { tariffType, voltageLevel, ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
  
  // Validate tariff type
  if (!PEA_TYPE_5_RATES[tariffType]) {
    throw new Error(`Invalid tariff type for Type 5. Must be "normal" or "tou", received: ${tariffType}`);
  }
  
  // Validate voltage level
  if (!PEA_TYPE_5_RATES[tariffType][voltageLevel]) {
    throw new Error(`Invalid voltage level for Type 5 ${tariffType}. Must be ">=69kV", "22-33kV", or "<22kV", received: ${voltageLevel}`);
  }
  
  const rates = PEA_TYPE_5_RATES[tariffType][voltageLevel];
  
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
  const totalBaseTariff = effectiveDemandCharge + energyCharge + pfCharge + rates.serviceCharge;
  const ftCharge = totalKwhForFt * (ftRateSatang / 100);
  const subTotal = totalBaseTariff + ftCharge;
  const vat = subTotal * VAT_RATE;
  const grandTotal = subTotal + vat;
  
  return {
    calculatedDemandCharge: Math.round(calculatedDemandCharge * 10) / 10,
    energyCharge: Math.round(energyCharge * 10) / 10,
    effectiveDemandCharge: Math.round(effectiveDemandCharge * 10) / 10,
    pfCharge: Math.round(pfCharge * 1000) / 1000,
    serviceCharge: rates.serviceCharge,
    ftCharge: Math.round(ftCharge * 10) / 10,
    subTotal: Math.round(subTotal * 1000) / 1000,
    vat: Math.round(vat * 100000) / 100000,
    grandTotal: Math.round(grandTotal * 100000) / 100000
  };
};

// Main calculation dispatcher
const calculateBill = (calculationType, data) => {
  switch (calculationType) {
    case 'type-2':
      if (data.tariffType === 'normal') {
        return _calculateType2Normal(data);
      } else if (data.tariffType === 'tou') {
        return _calculateType2Tou(data);
      } else {
        throw new Error('Invalid tariff type for Type 2. Must be "normal" or "tou"');
      }
    case 'type-3':
      return _calculateType3(data);
    case 'type-4':
      return _calculateType4(data);
    case 'type-5':
      return _calculateType5(data);
    default:
      throw new Error(`Invalid calculation type: ${calculationType}`);
  }
};

// PEA Type 2 - Small Business Service
const calculateType2 = async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'usage'];
  
  if (!validateCalculationInput(ctx, requiredFields)) {
    return;
  }

  try {
    const result = calculateBill('type-2', ctx.request.body);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// PEA Type 3 - Medium Business Service
const calculateType3 = async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  
  if (!validateCalculationInput(ctx, requiredFields)) {
    return;
  }

  try {
    const result = calculateBill('type-3', ctx.request.body);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// PEA Type 4 - Large Business Service
const calculateType4 = async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  
  if (!validateCalculationInput(ctx, requiredFields)) {
    return;
  }

  try {
    const result = calculateBill('type-4', ctx.request.body);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// PEA Type 5 - Specific Business Service
const calculateType5 = async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  
  if (!validateCalculationInput(ctx, requiredFields)) {
    return;
  }

  try {
    const result = calculateBill('type-5', ctx.request.body);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

module.exports = {
  calculateType2,
  calculateType3,
  calculateType4,
  calculateType5
};