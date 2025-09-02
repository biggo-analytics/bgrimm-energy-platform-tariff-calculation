// Corresponds to PEA, TYPE_5, tou, <22kV

const allPeaConfigs = require('../_config-pea-rates.js');
const config = allPeaConfigs['PEA_5.1.1_specific_TOU'];

const strategy = {
  /**
   * Calculates the bill for PEA Specific TOU (<22kV).
   * @param {object} params - Must contain `kwh` and `demand`.
   * @returns {object} The bill breakdown with energyCharge, demandCharge, serviceCharge, and totalAmount.
   */
  calculate({ kwh, demand }) {
    if (typeof kwh !== 'number' || typeof demand !== 'number' || kwh < 0 || demand < 0) {
      throw new Error('Invalid input: kwh and demand must be non-negative numbers.');
    }

    const demandCharge = config.demand * demand;
    const energyCharge = config.energy * kwh;
    const serviceCharge = config.serviceCharge;
    const totalAmount = serviceCharge + energyCharge + demandCharge;
    
    return {
      energyCharge: parseFloat(energyCharge.toFixed(2)),
      demandCharge: parseFloat(demandCharge.toFixed(2)),
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      breakdown: {
        energyCharge: parseFloat(energyCharge.toFixed(2)),
        demandCharge: parseFloat(demandCharge.toFixed(2)),
        serviceCharge: parseFloat(serviceCharge.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    };
  }
};

module.exports = strategy;
