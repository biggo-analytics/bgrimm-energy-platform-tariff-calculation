// Corresponds to MEA, TYPE_2, tou, 12-24kV

const allMeaConfigs = require('../_config-mea-rates.js');
const config = allMeaConfigs['MEA_2.2.2_small_TOU'];

const strategy = {
  /**
   * Calculates the bill for MEA Small TOU (12-24kV).
   * @param {object} params - Must contain `onPeakKwh` and `offPeakKwh`.
   * @returns {number} The total bill amount.
   */
  calculate({ onPeakKwh, offPeakKwh }) {
    if (typeof onPeakKwh !== 'number' || typeof offPeakKwh !== 'number' || onPeakKwh < 0 || offPeakKwh < 0) {
      throw new Error('Invalid input: onPeakKwh and offPeakKwh must be non-negative numbers.');
    }

    const onPeakCharge = config.onPeakRate * onPeakKwh;
    const offPeakCharge = config.offPeakRate * offPeakKwh;
    const total = config.serviceCharge + onPeakCharge + offPeakCharge;
    
    return parseFloat(total.toFixed(2));
  }
};

module.exports = strategy;
