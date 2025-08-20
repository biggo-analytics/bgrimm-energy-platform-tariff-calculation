/**
 * Electricity Service
 * Contains all electricity bill calculation logic
 */

// Constants
const SERVICE_CHARGE = 312.24;
const PF_PENALTY_RATE = 56.07;
const PF_THRESHOLD_FACTOR = 0.6197;
const MINIMUM_BILL_FACTOR = 0.70;
const VAT_RATE = 0.07;

// Rate tables
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

const calculatePowerFactorCharge = (peakKvar, overallPeakKw) => {
  const excessKvar = Math.max(0, peakKvar - (overallPeakKw * PF_THRESHOLD_FACTOR));
  return Math.round(excessKvar) * PF_PENALTY_RATE;
};

// Type 2 calculation functions
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

module.exports = {
  calculateBill
};
