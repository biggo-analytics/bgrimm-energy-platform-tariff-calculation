/**
 * Central PEA Rate Configuration
 * Contains all PEA electricity tariff rates organized by strategy name
 */

module.exports = {
  // TYPE_2 Small TOU Strategies
  'PEA_2.2.1_small_TOU': {
    serviceCharge: 33.29,
    onPeakRate: 5.7982,
    offPeakRate: 2.6369
  },

  'PEA_2.2.2_small_TOU': {
    serviceCharge: 312.24,
    onPeakRate: 5.1135,
    offPeakRate: 2.6037
  },

  // TYPE_3 Medium Normal Strategies
  'PEA_3.1.1_medium_normal': {
    demand: 175.70,
    energy: 3.1097,
    serviceCharge: 312.24
  },

  'PEA_3.1.2_medium_normal': {
    demand: 196.26,
    energy: 3.1471,
    serviceCharge: 312.24
  },

  'PEA_3.1.3_medium_normal': {
    demand: 221.50,
    energy: 3.1751,
    serviceCharge: 312.24
  },

  // TYPE_3 Medium TOU Strategies
  'PEA_3.2.1_medium_TOU': {
    demandOn: 74.14,
    energyOn: 4.1025,
    energyOff: 2.5849,
    serviceCharge: 312.24
  },

  'PEA_3.2.2_medium_TOU': {
    demandOn: 132.93,
    energyOn: 4.1839,
    energyOff: 2.6037,
    serviceCharge: 312.24
  },

  'PEA_3.2.3_medium_TOU': {
    demandOn: 210.00,
    energyOn: 4.3297,
    energyOff: 2.6369,
    serviceCharge: 312.24
  },

  // TYPE_4 Large TOD Strategies
  'PEA_4.1.1_large_TOD': {
    demandOn: 224.30,
    demandPartial: 29.91,
    demandOff: 0,
    energy: 3.1097,
    serviceCharge: 312.24
  },

  'PEA_4.1.2_large_TOD': {
    demandOn: 285.05,
    demandPartial: 58.88,
    demandOff: 0,
    energy: 3.1471,
    serviceCharge: 312.24
  },

  'PEA_4.1.3_large_TOD': {
    demandOn: 332.71,
    demandPartial: 68.22,
    demandOff: 0,
    energy: 3.1751,
    serviceCharge: 312.24
  },

  // TYPE_4 Large TOU Strategies
  'PEA_4.2.1_large_TOU': {
    demandOn: 74.14,
    energyOn: 4.1025,
    energyOff: 2.5849,
    serviceCharge: 312.24
  },

  'PEA_4.2.2_large_TOU': {
    demandOn: 132.93,
    energyOn: 4.1839,
    energyOff: 2.6037,
    serviceCharge: 312.24
  },

  'PEA_4.2.3_large_TOU': {
    demandOn: 210.00,
    energyOn: 4.3297,
    energyOff: 2.6369,
    serviceCharge: 312.24
  },

  // TYPE_5 Specific Normal Strategies (Note: These are named with "TOU" but have normal tariff structure)
  'PEA_5.1.1_specific_TOU': {
    demand: 220.56,
    energy: 3.1097,
    serviceCharge: 312.24
  },

  'PEA_5.1.2_specific_TOU': {
    demand: 256.07,
    energy: 3.1471,
    serviceCharge: 312.24
  },

  'PEA_5.1.3_specific_TOU': {
    demand: 276.64,
    energy: 3.1751,
    serviceCharge: 312.24
  },

  // TYPE_5 Specific TOU Strategies
  'PEA_5.2.1_specific_TOU': {
    demandOn: 74.14,
    energyOn: 4.1025,
    energyOff: 2.5849,
    serviceCharge: 312.24
  },

  'PEA_5.2.2_specific_TOU': {
    demandOn: 132.93,
    energyOn: 4.1839,
    energyOff: 2.6037,
    serviceCharge: 312.24
  },

  'PEA_5.2.3_specific_TOU': {
    demandOn: 210.00,
    energyOn: 4.3297,
    energyOff: 2.6369,
    serviceCharge: 312.24
  }
};
