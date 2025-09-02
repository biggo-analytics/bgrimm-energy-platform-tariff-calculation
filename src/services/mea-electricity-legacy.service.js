/**
 * MEA Electricity Legacy Service
 * Handles MEA electricity bill calculations in the format expected by tests
 */

const { MEA_RATES, MEA_SERVICE_CHARGE } = require('../config/mea-rates');
const { calculateTieredEnergyCharge } = require('../utils/calculation-helpers');

class MEAElectricityLegacyService {
  /**
   * Calculate Type 2 electricity bill
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result with expected format
   */
  calculateType2(data) {
    const { tariffType, voltageLevel, ftRateSatang, usage } = data;
    
    if (!tariffType || !voltageLevel || !ftRateSatang || !usage) {
      throw new Error('Missing required parameters: tariffType, voltageLevel, ftRateSatang, usage');
    }

    const rates = MEA_RATES.TYPE_2[tariffType];
    if (!rates || !rates[voltageLevel]) {
      throw new Error(`Invalid tariff type or voltage level: ${tariffType}, ${voltageLevel}`);
    }

    let energyCharge = 0;
    let baseTariff = 0;
    let ftCharge = 0;
    let vat = 0;
    let totalBill = 0;

    if (tariffType === 'normal') {
      // Normal tariff with tiered rates
      const tieredRates = [
        { threshold: rates[voltageLevel].tier1.threshold, rate: rates[voltageLevel].tier1.rate },
        { threshold: rates[voltageLevel].tier2.threshold, rate: rates[voltageLevel].tier2.rate },
        { threshold: rates[voltageLevel].tier3.threshold, rate: rates[voltageLevel].tier3.rate }
      ];
      
      energyCharge = calculateTieredEnergyCharge(usage.total_kwh, tieredRates);
      baseTariff = energyCharge;
    } else if (tariffType === 'tou') {
      // TOU tariff with peak/off-peak rates
      const { on_peak_kwh = 0, off_peak_kwh = 0 } = usage;
      const onPeakCharge = on_peak_kwh * rates[voltageLevel].onPeakRate;
      const offPeakCharge = off_peak_kwh * rates[voltageLevel].offPeakRate;
      energyCharge = onPeakCharge + offPeakCharge;
      baseTariff = energyCharge;
    }

    // Calculate fuel adjustment charge
    ftCharge = (baseTariff * ftRateSatang) / 100;

    // Calculate VAT (7%)
    vat = (baseTariff + ftCharge) * 0.07;

    // Calculate total bill
    totalBill = baseTariff + ftCharge + vat;

    return {
      energyCharge: Math.round(energyCharge * 100) / 100,
      baseTariff: Math.round(baseTariff * 100) / 100,
      ftCharge: Math.round(ftCharge * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      totalBill: Math.round(totalBill * 100) / 100
    };
  }
}

module.exports = new MEAElectricityLegacyService();
