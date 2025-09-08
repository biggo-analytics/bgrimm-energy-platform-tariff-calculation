/**
 * PEA 2.2.2 Small TOU Strategy
 * PEA Type 2, Small General Service, TOU Tariff, 22-33kV
 */

const ICalculationStrategy = require('./ICalculationStrategy');
const { calculateTOUCharge, calculateServiceCharge, calculateSimpleBill, normalizeUsageData } = require('./shared-calculation-utils');

class PEA_2_2_2_small_TOU extends ICalculationStrategy {
  constructor() {
    const rates = {
      serviceCharge: 312.24,
      onPeakRate: 5.1135,
      offPeakRate: 2.6037
    };
    super(rates);
  }

  getProvider() { return 'PEA'; }
  getCalculationType() { return '2.2.2'; }
  getTariffModel() { return 'tou'; }
  getVoltageLevel() { return '22-33kV'; }
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

module.exports = PEA_2_2_2_small_TOU;
