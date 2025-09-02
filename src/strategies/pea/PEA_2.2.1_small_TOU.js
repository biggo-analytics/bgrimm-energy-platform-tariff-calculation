// Corresponds to PEA, TYPE_2, tou, <22kV

const allPeaConfigs = require('../_config-pea-rates.js');
const config = allPeaConfigs['PEA_2.2.1_small_TOU'];

const strategy = {
  /**
   * Calculates the bill for PEA Small TOU (<22kV).
   * @param {object} params - Must contain `onPeakKwh` and `offPeakKwh`.
   * @returns {object} The bill breakdown with energyCharge, serviceCharge, and totalAmount.
   */
  calculate({ onPeakKwh, offPeakKwh }) {
    // Convert to numbers and validate
    const onPeak = parseFloat(onPeakKwh);
    const offPeak = parseFloat(offPeakKwh);
    
    if (isNaN(onPeak) || isNaN(offPeak) || onPeak < 0 || offPeak < 0) {
      throw new Error('Invalid input: onPeakKwh and offPeakKwh must be non-negative numbers.');
    }

    const onPeakCharge = config.onPeakRate * onPeak;
    const offPeakCharge = config.offPeakRate * offPeak;
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
