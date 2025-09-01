// Corresponds to MEA, TYPE_3, tou, 12-24kV

const allMeaConfigs = require('../_config-mea-rates.js');
const config = allMeaConfigs['MEA_3.2.2_medium_TOU'];

const strategy = {
  /**
   * Calculates the bill for MEA Medium TOU (12-24kV).
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
