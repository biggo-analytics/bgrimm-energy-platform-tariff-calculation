// Corresponds to PEA, TYPE_2, tou, <22kV

const allPeaConfigs = require('../_config-pea-rates.js');
const config = allPeaConfigs['PEA_2.2.1_small_TOU'];

const strategy = {
  /**
   * Calculates the bill for PEA Small TOU (<22kV).
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
