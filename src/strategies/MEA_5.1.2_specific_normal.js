/**
 * MEA_5.1.2_specific_normal Strategy
 * MEA 5.1.2 specific NORMAL (12-24kV)
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateBasicDemandCharge, calculateBasicEnergyCharge, calculateServiceCharge, calculateCompleteBill, normalizeUsageData } = require('./shared-calculation-utils');

class MEA_5_1_2_specific_normal extends ICalculationStrategy {
  constructor() {
    const rates = {
    "demand": 256.07,
    "energy": 3.1271
};
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '5.1.2'; }
  getTariffModel() { return 'normal'; }
  getVoltageLevel() { return '12-24kV'; }
  getCustomerSize() { return 'specific'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-3');
    
    const demandCharge = calculateBasicDemandCharge(normalizedUsage.overallPeakKw, this.rates.demand);
    const energyCharge = calculateBasicEnergyCharge(normalizedUsage.totalKwh, this.rates.energy);
    const serviceCharge = calculateServiceCharge(312.24);
    
    return calculateCompleteBill({
      energyCharge,
      demandCharge,
      serviceCharge,
      ftRateSatang,
      totalKwh: normalizedUsage.totalKwh,
      peakKvar,
      overallPeakKw: normalizedUsage.overallPeakKw,
      highestDemandChargeLast12m
    });
  }
}

module.exports = MEA_5_1_2_specific_normal;