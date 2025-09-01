// Corresponds to MEA, TYPE_3, normal, <12kV

const allMeaConfigs = require('../_config-mea-rates.js');
const config = allMeaConfigs['MEA_3.1.3_medium_normal'];

const strategy = {
  /**
   * Calculates the bill for MEA Medium Normal (<12kV).
   * @param {object} params - Must contain `kwh` and `demand`.
   * @returns {number} The total bill amount.
   */
  calculate({ kwh, demand }) {
    if (typeof kwh !== 'number' || typeof demand !== 'number' || kwh < 0 || demand < 0) {
      throw new Error('Invalid input: kwh and demand must be non-negative numbers.');
    }

    const demandCharge = config.demand * demand;
    const energyCharge = config.energy * kwh;
    const total = config.serviceCharge + demandCharge + energyCharge;
    
    return parseFloat(total.toFixed(2));
  }
};

module.exports = strategy;
