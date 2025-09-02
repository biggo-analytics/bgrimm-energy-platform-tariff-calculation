// Corresponds to PEA, TYPE_4, tod, >=69kV

const allPeaConfigs = require('../_config-pea-rates.js');
const config = allPeaConfigs['PEA_4.1.1_large_TOD'];

const strategy = {
  /**
   * Calculates the bill for PEA Large TOD (>=69kV).
   * @param {object} params - Must contain `kwh`, `onPeakDemand`, `partialPeakDemand`, and `offPeakDemand`.
   * @returns {object} The bill breakdown with energyCharge, onPeakDemandCharge, partialPeakDemandCharge, offPeakDemandCharge, serviceCharge, and totalAmount.
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
    const totalAmount = serviceCharge + energyCharge + onPeakDemandCharge + partialPeakDemandCharge + offPeakDemandCharge;
    
    return {
      energyCharge: parseFloat(energyCharge.toFixed(2)),
      onPeakDemandCharge: parseFloat(onPeakDemandCharge.toFixed(2)),
      partialPeakDemandCharge: parseFloat(partialPeakDemandCharge.toFixed(2)),
      offPeakDemandCharge: parseFloat(offPeakDemandCharge.toFixed(2)),
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      breakdown: {
        energyCharge: parseFloat(energyCharge.toFixed(2)),
        onPeakDemandCharge: parseFloat(onPeakDemandCharge.toFixed(2)),
        partialPeakDemandCharge: parseFloat(partialPeakDemandCharge.toFixed(2)),
        offPeakDemandCharge: parseFloat(offPeakDemandCharge.toFixed(2)),
        serviceCharge: parseFloat(serviceCharge.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    };
  }
};

module.exports = strategy;
