/**
 * PEA_3.1.2_medium_normal Strategy
 * PEA 3.1.2 medium NORMAL (22-33kV)
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateBasicDemandCharge, calculateBasicEnergyCharge, calculateServiceCharge, calculateCompleteBill, normalizeUsageData } = require('./shared-calculation-utils');

class PEA_3_1_2_medium_normal extends ICalculationStrategy {
  constructor() {
    const rates = {
    "demand": 196.26,
    "energy": 3.1471,
    "serviceCharge": 312.24
};
    super(rates);
  }

  getProvider() { return 'PEA'; }
  getCalculationType() { return '3.1.2'; }
  getTariffModel() { return 'normal'; }
  getVoltageLevel() { return '22-33kV'; }
  getCustomerSize() { return 'medium'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-3');
    
    const demandCharge = calculateBasicDemandCharge(usage.peak_kw, this.rates.demand);
    const energyCharge = calculateBasicEnergyCharge(usage.total_kwh, this.rates.energy);
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

module.exports = PEA_3_1_2_medium_normal;