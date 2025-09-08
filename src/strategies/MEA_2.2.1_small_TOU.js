/**
 * MEA_2.2.1_small_TOU Strategy
 * MEA 2.2.1 small TOU (<12kV)
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateTOUCharge, calculateServiceCharge, calculateSimpleBill, normalizeUsageData } = require('./shared-calculation-utils');

class MEA_2_2_1_small_TOU extends ICalculationStrategy {
  constructor() {
    const rates = {
    "serviceCharge": 33.29,
    "onPeakRate": 5.7982,
    "offPeakRate": 2.6369
};
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '2.2.1'; }
  getTariffModel() { return 'tou'; }
  getVoltageLevel() { return '<12kV'; }
  getCustomerSize() { return 'small'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-2');
    
    const serviceCharge = calculateServiceCharge(this.rates.serviceCharge);
    const energyCharge = calculateTOUCharge(
      normalizedUsage.onPeakKwh,
      normalizedUsage.offPeakKwh,
      this.rates.onPeakRate,
      this.rates.offPeakRate
    );
    
    return calculateSimpleBill({
      energyCharge,
      serviceCharge,
      ftRateSatang,
      totalKwh: normalizedUsage.totalKwh
    });
  }
}

module.exports = MEA_2_2_1_small_TOU;