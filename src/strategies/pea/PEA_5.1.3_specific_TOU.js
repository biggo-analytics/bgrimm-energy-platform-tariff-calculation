// Corresponds to PEA, TYPE_5, normal, <22kV

const allPeaConfigs = require('../_config-pea-rates.js');
const config = allPeaConfigs['PEA_5.1.3_specific_TOU'];

const strategy = {
  /**
   * Calculates the bill for PEA Specific TOU (<22kV).
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
