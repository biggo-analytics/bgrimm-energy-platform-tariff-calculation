// Corresponds to MEA, TYPE_2, tou, 12-24kV

const allMeaConfigs = require('../_config-mea-rates.js');
const config = allMeaConfigs['MEA_2.2.2_small_TOU'];

const strategy = {
  /**
   * Calculates the bill for MEA Small TOU (12-24kV).
   * @param {object} params - Must contain `onPeakKwh` and `offPeakKwh`.
   * @returns {object} The bill breakdown with energyCharge, serviceCharge, and totalAmount.
   */
  calculate({ onPeakKwh, offPeakKwh }) {
    if (typeof onPeakKwh !== 'number' || typeof offPeakKwh !== 'number' || onPeakKwh < 0 || offPeakKwh < 0) {
      throw new Error('Invalid input: onPeakKwh and offPeakKwh must be non-negative numbers.');
    }

    const onPeakCharge = config.onPeakRate * onPeakKwh;
    const offPeakCharge = config.offPeakRate * offPeakKwh;
    const energyCharge = onPeakCharge + offPeakCharge;
    const serviceCharge = config.serviceCharge;
    const totalAmount = serviceCharge + energyCharge;
    
    return {
      energyCharge: parseFloat(energyCharge.toFixed(2)),
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      breakdown: {
        onPeakCharge: parseFloat(onPeakCharge.toFixed(2)),
        offPeakCharge: parseFloat(offPeakCharge.toFixed(2)),
        energyCharge: parseFloat(energyCharge.toFixed(2)),
        serviceCharge: parseFloat(serviceCharge.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    };
  }
};

module.exports = strategy;
