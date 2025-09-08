/**
 * MEA_2.2.2_small_TOU Strategy
 * MEA 2.2.2 small TOU (12-24kV)
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateTOUCharge, calculateServiceCharge, calculateSimpleBill, normalizeUsageData } = require('./shared-calculation-utils');

class MEA_2_2_2_small_TOU extends ICalculationStrategy {
  constructor() {
    const rates = {
    "serviceCharge": 312.24,
    "onPeakRate": 5.1135,
    "offPeakRate": 2.6037
};
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '2.2.2'; }
  getTariffModel() { return 'tou'; }
  getVoltageLevel() { return '12-24kV'; }
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

module.exports = MEA_2_2_2_small_TOU;