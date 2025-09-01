// Corresponds to PEA, TYPE_4, tod, <22kV

const allPeaConfigs = require('../_config-pea-rates.js');
const config = allPeaConfigs['PEA_4.1.3_large_TOD'];

const strategy = {
  /**
   * Calculates the bill for PEA Large TOD (<22kV).
   * @param {object} params - Must contain `kwh`, `onPeakDemand`, `partialPeakDemand`, and `offPeakDemand`.
   * @returns {number} The total bill amount.
   */
  calculate({ kwh, onPeakDemand, partialPeakDemand, offPeakDemand }) {
    if (typeof kwh !== 'number' || typeof onPeakDemand !== 'number' || 
        typeof partialPeakDemand !== 'number' || typeof offPeakDemand !== 'number' || 
        kwh < 0 || onPeakDemand < 0 || partialPeakDemand < 0 || offPeakDemand < 0) {
      throw new Error('Invalid input: kwh and all demand values must be non-negative numbers.');
    }

    const onPeakDemandCharge = config.demandOn * onPeakDemand;
    const partialPeakDemandCharge = config.demandPartial * partialPeakDemand;
    const offPeakDemandCharge = config.demandOff * offPeakDemand;
    const energyCharge = config.energy * kwh;
    const total = config.serviceCharge + onPeakDemandCharge + partialPeakDemandCharge + offPeakDemandCharge + energyCharge;
    
    return parseFloat(total.toFixed(2));
  }
};

module.exports = strategy;
