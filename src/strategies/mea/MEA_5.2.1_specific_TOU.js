// Corresponds to MEA, TYPE_5, tou, >=69kV

const allMeaConfigs = require('../_config-mea-rates.js');
const config = allMeaConfigs['MEA_5.2.1_specific_TOU'];

const strategy = {
  /**
   * Calculates the bill for MEA Specific TOU (>=69kV).
   * @param {object} params - Must contain `onPeakKwh`, `offPeakKwh`, and `demand`.
   * @returns {number} The total bill amount.
   */
  calculate({ onPeakKwh, offPeakKwh, demand }) {
    if (typeof onPeakKwh !== 'number' || typeof offPeakKwh !== 'number' || typeof demand !== 'number' || 
        onPeakKwh < 0 || offPeakKwh < 0 || demand < 0) {
      throw new Error('Invalid input: onPeakKwh, offPeakKwh, and demand must be non-negative numbers.');
    }

    const demandCharge = config.demandOn * demand;
    const onPeakCharge = config.energyOn * onPeakKwh;
    const offPeakCharge = config.energyOff * offPeakKwh;
    const total = config.serviceCharge + demandCharge + onPeakCharge + offPeakCharge;
    
    return parseFloat(total.toFixed(2));
  }
};

module.exports = strategy;
