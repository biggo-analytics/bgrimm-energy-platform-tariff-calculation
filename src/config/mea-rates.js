/**
 * MEA Electricity Rates Configuration
 * Contains all MEA electricity tariff rates
 */

const MEA_RATES = {
  TYPE_2: {
    // Normal Tariff Rates
    normal: {
      '<12kV': {
        serviceCharge: 33.29,
        energyRates: [
          { threshold: 0, rate: 3.2484 },
          { threshold: 150, rate: 4.2218 },
          { threshold: 400, rate: 4.4217 }
        ]
      },
      '12-24kV': {
        serviceCharge: 312.24,
        energyRate: 3.9086
      }
    },
    // Time of Use (TOU) Tariff Rates
    tou: {
      '<12kV': {
        serviceCharge: 33.29,
        onPeakRate: 5.7982,
        offPeakRate: 2.6369
      },
      '12-24kV': {
        serviceCharge: 312.24,
        onPeakRate: 5.1135,
        offPeakRate: 2.6037
      }
    }
  },

  TYPE_3: {
    normal: {
      '>=69kV': { demand: 175.70, energy: 3.1097 },
      '12-24kV': { demand: 196.26, energy: 3.1271 },
      '<12kV': { demand: 221.50, energy: 3.1751 }
    },
    tou: {
      '>=69kV': { demand_on: 74.14, energy_on: 4.1025, energy_off: 2.5849 },
      '12-24kV': { demand_on: 132.93, energy_on: 4.1839, energy_off: 2.6037 },
      '<12kV': { demand_on: 210.80, energy_on: 4.5297, energy_off: 2.6369 }
    }
  },

  TYPE_4: {
    tod: {
      '>=69kV': { demand_on: 280.00, demand_partial: 74.14, demand_off: 0, energy: 3.1097 },
      '12-24kV': { demand_on: 334.33, demand_partial: 132.93, demand_off: 0, energy: 3.1271 },
      '<12kV': { demand_on: 352.71, demand_partial: 210.80, demand_off: 0, energy: 3.1751 }
    },
    tou: {
      '>=69kV': { demand_on: 74.14, energy_on: 4.1025, energy_off: 2.5849 },
      '12-24kV': { demand_on: 132.93, energy_on: 4.1839, energy_off: 2.6037 },
      '<12kV': { demand_on: 210.80, energy_on: 4.5297, energy_off: 2.6369 }
    }
  },

  TYPE_5: {
    normal: {
      '>=69kV': { demand: 220.36, energy: 3.1097 },
      '12-24kV': { demand: 256.07, energy: 3.1271 },
      '<12kV': { demand: 276.64, energy: 3.1751 }
    },
    tou: {
      '>=69kV': { demand_on: 74.14, energy_on: 4.1025, energy_off: 2.5849 },
      '12-24kV': { demand_on: 132.93, energy_on: 4.1839, energy_off: 2.6037 },
      '<12kV': { demand_on: 210.80, energy_on: 4.5297, energy_off: 2.6369 }
    }
  }
};

// Service charge for MEA (used in Type 3, 4, 5)
const MEA_SERVICE_CHARGE = 312.24;

module.exports = {
  MEA_RATES,
  MEA_SERVICE_CHARGE
};
