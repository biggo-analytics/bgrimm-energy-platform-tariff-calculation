/**
 * Central MEA Rate Configuration
 * Contains all MEA electricity tariff rates organized by strategy name
 */

module.exports = {
  // TYPE_2 Small TOU Strategies
  'MEA_2.2.1_small_TOU': {
    serviceCharge: 33.29,
    onPeakRate: 5.7982,
    offPeakRate: 2.6369
  },

  'MEA_2.2.2_small_TOU': {
    serviceCharge: 312.24,
    onPeakRate: 5.1135,
    offPeakRate: 2.6037
  },

  // TYPE_3 Medium Normal Strategies
  'MEA_3.1.1_medium_normal': {
    demand: 175.70,
    energy: 3.1097,
    serviceCharge: 312.24
  },

  'MEA_3.1.2_medium_normal': {
    demand: 196.26,
    energy: 3.1271,
    serviceCharge: 312.24
  },

  'MEA_3.1.3_medium_normal': {
    demand: 221.50,
    energy: 3.1751,
    serviceCharge: 312.24
  },

  // TYPE_3 Medium TOU Strategies
  'MEA_3.2.1_medium_TOU': {
    demandOn: 74.14,
    energyOn: 4.1025,
    energyOff: 2.5849,
    serviceCharge: 312.24
  },

  'MEA_3.2.2_medium_TOU': {
    demandOn: 132.93,
    energyOn: 4.1839,
    energyOff: 2.6037,
    serviceCharge: 312.24
  },

  'MEA_3.2.3_medium_TOU': {
    demandOn: 210.80,
    energyOn: 4.5297,
    energyOff: 2.6369,
    serviceCharge: 312.24
  },

  // TYPE_4 Large TOD Strategies
  'MEA_4.1.1_large_TOD': {
    demandOn: 280.00,
    demandPartial: 74.14,
    demandOff: 0,
    energy: 3.1097,
    serviceCharge: 312.24
  },

  'MEA_4.1.2_large_TOD': {
    demandOn: 334.33,
    demandPartial: 132.93,
    demandOff: 0,
    energy: 3.1271,
    serviceCharge: 312.24
  },

  'MEA_4.1.3_large_TOD': {
    demandOn: 352.71,
    demandPartial: 210.80,
    demandOff: 0,
    energy: 3.1751,
    serviceCharge: 312.24
  },

  // TYPE_4 Large TOU Strategies
  'MEA_4.2.1_large_TOU': {
    demandOn: 74.14,
    energyOn: 4.1025,
    energyOff: 2.5849,
    serviceCharge: 312.24
  },

  'MEA_4.2.2_large_TOU': {
    demandOn: 132.93,
    energyOn: 4.1839,
    energyOff: 2.6037,
    serviceCharge: 312.24
  },

  'MEA_4.2.3_large_TOU': {
    demandOn: 210.80,
    energyOn: 4.5297,
    energyOff: 2.6369,
    serviceCharge: 312.24
  },

  // TYPE_5 Specific Normal Strategies
  'MEA_5.1.1_specific_normal': {
    demand: 220.36,
    energy: 3.1097,
    serviceCharge: 312.24
  },

  'MEA_5.1.2_specific_normal': {
    demand: 256.07,
    energy: 3.1271,
    serviceCharge: 312.24
  },

  'MEA_5.1.3_specific_normal': {
    demand: 276.64,
    energy: 3.1751,
    serviceCharge: 312.24
  },

  // TYPE_5 Specific TOU Strategies
  'MEA_5.2.1_specific_TOU': {
    demandOn: 74.14,
    energyOn: 4.1025,
    energyOff: 2.5849,
    serviceCharge: 312.24
  },

  'MEA_5.2.2_specific_TOU': {
    demandOn: 132.93,
    energyOn: 4.1839,
    energyOff: 2.6037,
    serviceCharge: 312.24
  },

  'MEA_5.2.3_specific_TOU': {
    demandOn: 210.80,
    energyOn: 4.5297,
    energyOff: 2.6369,
    serviceCharge: 312.24
  }
};
