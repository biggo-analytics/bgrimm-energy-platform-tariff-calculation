/**
 * PEA Electricity Controller
 * Handles PEA electricity bill calculation requests
 */

// Constants
const VAT_RATE = 0.07;

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

module.exports = {
  calculateType2
};