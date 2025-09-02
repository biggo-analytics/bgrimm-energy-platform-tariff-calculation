// Corresponds to MEA, TYPE_4, tod, >=69kV

const allMeaConfigs = require('../_config-mea-rates.js');
const config = allMeaConfigs['MEA_4.1.1_large_TOD'];

const strategy = {
  /**
   * Calculates the bill for MEA Large TOD (>=69kV).
   * @param {object} params - Must contain `kwh`, `onPeakDemand`, `partialPeakDemand`, and `offPeakDemand`.
   * @returns {object} The bill breakdown with energyCharge, serviceCharge, and totalAmount.
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
    const serviceCharge = config.serviceCharge;
    const totalAmount = serviceCharge + onPeakDemandCharge + partialPeakDemandCharge + offPeakDemandCharge + energyCharge;
    
    return {
      energyCharge: parseFloat(energyCharge.toFixed(2)),
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      breakdown: {
        onPeakDemandCharge: parseFloat(onPeakDemandCharge.toFixed(2)),
        partialPeakDemandCharge: parseFloat(partialPeakDemandCharge.toFixed(2)),
        offPeakDemandCharge: parseFloat(offPeakDemandCharge.toFixed(2)),
        energyCharge: parseFloat(energyCharge.toFixed(2)),
        serviceCharge: parseFloat(serviceCharge.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    };
  }
};

module.exports = strategy;
