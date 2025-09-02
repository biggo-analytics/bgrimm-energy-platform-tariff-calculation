// Corresponds to MEA, TYPE_5, normal, 12-24kV

const allMeaConfigs = require('../_config-mea-rates.js');
const config = allMeaConfigs['MEA_5.1.2_specific_normal'];

const strategy = {
  /**
   * Calculates the bill for MEA Specific Normal (12-24kV).
   * @param {object} params - Must contain `kwh` and `demand`.
   * @returns {object} The bill breakdown with energyCharge, serviceCharge, and totalAmount.
   */
  calculate({ kwh, demand }) {
    if (typeof kwh !== 'number' || typeof demand !== 'number' || kwh < 0 || demand < 0) {
      throw new Error('Invalid input: kwh and demand must be non-negative numbers.');
    }

    const demandCharge = config.demand * demand;
    const energyCharge = config.energy * kwh;
    const serviceCharge = config.serviceCharge;
    const totalAmount = serviceCharge + demandCharge + energyCharge;
    
    return {
      energyCharge: parseFloat(energyCharge.toFixed(2)),
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      breakdown: {
        demandCharge: parseFloat(demandCharge.toFixed(2)),
        energyCharge: parseFloat(energyCharge.toFixed(2)),
        serviceCharge: parseFloat(serviceCharge.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    };
  }
};

module.exports = strategy;
