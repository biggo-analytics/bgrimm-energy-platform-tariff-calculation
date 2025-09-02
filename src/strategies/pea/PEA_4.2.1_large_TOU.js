// Corresponds to PEA, TYPE_4, tou, >=69kV

const allPeaConfigs = require('../_config-pea-rates.js');
const config = allPeaConfigs['PEA_4.2.1_large_TOU'];

const strategy = {
  /**
   * Calculates the bill for PEA Large TOU (>=69kV).
   * @param {object} params - Must contain `onPeakKwh`, `offPeakKwh`, and `demand`.
   * @returns {object} The bill breakdown with energyCharge, serviceCharge, and totalAmount.
   */
  calculate({ onPeakKwh, offPeakKwh, demand }) {
    if (typeof onPeakKwh !== 'number' || typeof offPeakKwh !== 'number' || typeof demand !== 'number' || 
        onPeakKwh < 0 || offPeakKwh < 0 || demand < 0) {
      throw new Error('Invalid input: onPeakKwh, offPeakKwh, and demand must be non-negative numbers.');
    }

    const demandCharge = config.demandOn * demand;
    const onPeakCharge = config.energyOn * onPeakKwh;
    const offPeakCharge = config.energyOff * offPeakKwh;
    const energyCharge = offPeakCharge;
    const serviceCharge = config.serviceCharge;
    const totalAmount = serviceCharge + energyCharge;
    
    return {
      energyCharge: parseFloat(energyCharge.toFixed(2)),
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      breakdown: {
        energyCharge: parseFloat(energyCharge.toFixed(2)),
        serviceCharge: parseFloat(serviceCharge.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    };
  }
};

module.exports = strategy;
