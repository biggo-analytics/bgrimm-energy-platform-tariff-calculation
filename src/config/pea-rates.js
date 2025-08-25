/**
 * PEA Electricity Rates Configuration
 * Contains all PEA electricity tariff rates
 */

const PEA_RATES = {
  TYPE_2: {
    // Normal Tariff Rates
    normal: {
      '<22kV': {
        serviceCharge: 33.29,
        energyRates: [
          { threshold: 0, rate: 3.2484 },
          { threshold: 150, rate: 4.2218 },
          { threshold: 400, rate: 4.4217 }
        ]
      },
      '22-33kV': {
        serviceCharge: 312.24,
        energyRate: 3.9086
      }
    },
    // Time of Use (TOU) Tariff Rates
    tou: {
      '<22kV': {
        serviceCharge: 33.29,
        onPeakRate: 5.7982,
        offPeakRate: 2.6369
      },
      '22-33kV': {
        serviceCharge: 312.24,
        onPeakRate: 5.1135,
        offPeakRate: 2.6037
      }
    }
  },

  TYPE_3: {
    normal: {
      '>=69kV': {
        demand: 175.70,
        energy: 3.1097,
        serviceCharge: 312.24
      },
      '22-33kV': {
        demand: 196.26,
        energy: 3.1471,
        serviceCharge: 312.24
      },
      '<22kV': {
        demand: 221.50,
        energy: 3.1751,
        serviceCharge: 312.24
      }
    },
    tou: {
      '>=69kV': {
        demand_on: 74.14,
        energy_on: 4.1025,
        energy_off: 2.5849,
        serviceCharge: 312.24
      },
      '22-33kV': {
        demand_on: 132.93,
        energy_on: 4.1839,
        energy_off: 2.6037,
        serviceCharge: 312.24
      },
      '<22kV': {
        demand_on: 210.00,
        energy_on: 4.3297,
        energy_off: 2.6369,
        serviceCharge: 312.24
      }
    }
  },

  TYPE_4: {
    tod: {
      '>=69kV': {
        demand_on: 224.30,
        demand_partial: 29.91,
        demand_off: 0,
        energy: 3.1097,
        serviceCharge: 312.24
      },
      '22-33kV': {
        demand_on: 285.05,
        demand_partial: 58.88,
        demand_off: 0,
        energy: 3.1471,
        serviceCharge: 312.24
      },
      '<22kV': {
        demand_on: 332.71,
        demand_partial: 68.22,
        demand_off: 0,
        energy: 3.1751,
        serviceCharge: 312.24
      }
    },
    tou: {
      '>=69kV': {
        demand_on: 74.14,
        energy_on: 4.1025,
        energy_off: 2.5849,
        serviceCharge: 312.24
      },
      '22-33kV': {
        demand_on: 132.93,
        energy_on: 4.1839,
        energy_off: 2.6037,
        serviceCharge: 312.24
      },
      '<22kV': {
        demand_on: 210.00,
        energy_on: 4.3297,
        energy_off: 2.6369,
        serviceCharge: 312.24
      }
    }
  },

  TYPE_5: {
    normal: {
      '>=69kV': {
        demand: 220.56,
        energy: 3.1097,
        serviceCharge: 312.24
      },
      '22-33kV': {
        demand: 256.07,
        energy: 3.1471,
        serviceCharge: 312.24
      },
      '<22kV': {
        demand: 276.64,
        energy: 3.1751,
        serviceCharge: 312.24
      }
    },
    tou: {
      '>=69kV': {
        demand_on: 74.14,
        energy_on: 4.1025,
        energy_off: 2.5849,
        serviceCharge: 312.24
      },
      '22-33kV': {
        demand_on: 132.93,
        energy_on: 4.1839,
        energy_off: 2.6037,
        serviceCharge: 312.24
      },
      '<22kV': {
        demand_on: 210.00,
        energy_on: 4.3297,
        energy_off: 2.6369,
        serviceCharge: 312.24
      }
    }
  }
};

module.exports = {
  PEA_RATES
};
