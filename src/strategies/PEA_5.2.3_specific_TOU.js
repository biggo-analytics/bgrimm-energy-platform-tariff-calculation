/**
 * PEA_5.2.3_specific_TOU Strategy
 * PEA 5.2.3 specific TOU (<22kV)
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateTOUCharge, calculateBasicDemandCharge, calculateServiceCharge, calculateCompleteBill, normalizeUsageData } = require('./shared-calculation-utils');

class PEA_5_2_3_specific_TOU extends ICalculationStrategy {
  constructor() {
    const rates = {
    "demand_on": 210,
    "energy_on": 4.3297,
    "energy_off": 2.6369,
    "serviceCharge": 312.24
};
    super(rates);
  }

  getProvider() { return 'PEA'; }
  getCalculationType() { return '5.2.3'; }
  getTariffModel() { return 'tou'; }
  getVoltageLevel() { return '<22kV'; }
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

module.exports = PEA_5_2_3_specific_TOU;