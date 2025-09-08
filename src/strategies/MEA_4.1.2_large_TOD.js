/**
 * MEA_4.1.2_large_TOD Strategy
 * MEA 4.1.2 large TOD (12-24kV)
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateTODDemandCharge, calculateBasicEnergyCharge, calculateServiceCharge, calculateCompleteBill, normalizeUsageData } = require('./shared-calculation-utils');

class MEA_4_1_2_large_TOD extends ICalculationStrategy {
  constructor() {
    const rates = {
    "demand_on": 334.33,
    "demand_partial": 132.93,
    "demand_off": 0,
    "energy": 3.1271
};
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '4.1.2'; }
  getTariffModel() { return 'tod'; }
  getVoltageLevel() { return '12-24kV'; }
  getCustomerSize() { return 'large'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-4');
    
    const demandCharge = calculateTODDemandCharge(
      usage.on_peak_kw,
      usage.partial_peak_kw,
      usage.off_peak_kw,
      this.rates.demand_on,
      this.rates.demand_partial,
      this.rates.demand_off
    );
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

module.exports = MEA_4_1_2_large_TOD;