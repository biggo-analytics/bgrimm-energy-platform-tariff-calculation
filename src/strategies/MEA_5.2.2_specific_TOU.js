/**
 * MEA_5.2.2_specific_TOU Strategy
 * MEA 5.2.2 specific TOU (12-24kV)
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateTOUCharge, calculateBasicDemandCharge, calculateServiceCharge, calculateCompleteBill, normalizeUsageData } = require('./shared-calculation-utils');

class MEA_5_2_2_specific_TOU extends ICalculationStrategy {
  constructor() {
    const rates = {
    "demand_on": 132.93,
    "energy_on": 4.1839,
    "energy_off": 2.6037
};
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '5.2.2'; }
  getTariffModel() { return 'tou'; }
  getVoltageLevel() { return '12-24kV'; }
  getCustomerSize() { return 'specific'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-3');
    
    const demandCharge = calculateBasicDemandCharge(usage.on_peak_kw, this.rates.demand_on);
    const energyCharge = calculateTOUCharge(
      usage.on_peak_kwh,
      usage.off_peak_kwh,
      this.rates.energy_on,
      this.rates.energy_off
    );
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

module.exports = MEA_5_2_2_specific_TOU;