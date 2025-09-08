/**
 * PEA_4.1.3_large_TOD Strategy
 * PEA 4.1.3 large TOD (<22kV)
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateTODDemandCharge, calculateBasicEnergyCharge, calculateServiceCharge, calculateCompleteBill, normalizeUsageData } = require('./shared-calculation-utils');

class PEA_4_1_3_large_TOD extends ICalculationStrategy {
  constructor() {
    const rates = {
    "demand_on": 332.71,
    "demand_partial": 68.22,
    "demand_off": 0,
    "energy": 3.1751,
    "serviceCharge": 312.24
};
    super(rates);
  }

  getProvider() { return 'PEA'; }
  getCalculationType() { return '4.1.3'; }
  getTariffModel() { return 'tod'; }
  getVoltageLevel() { return '<22kV'; }
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

module.exports = PEA_4_1_3_large_TOD;