/**
 * Shared Constants
 * Common constants used across MEA and PEA electricity calculations
 */

// Tax and penalty rates
const VAT_RATE = 0.07;
const PF_PENALTY_RATE = 56.07;
const PF_THRESHOLD_FACTOR = 0.6197;
const MINIMUM_BILL_FACTOR = 0.70;

// Voltage levels
const VOLTAGE_LEVELS = {
  LOW: '<22kV',      // For PEA
  MEDIUM: '22-33kV', // For PEA
  HIGH: '>=69kV',    // For PEA
  // MEA voltage levels
  MEA_LOW: '<12kV',  // For MEA
  MEA_MEDIUM: '12-24kV', // For MEA
  MEA_HIGH: '>=69kV' // For MEA
};

// Tariff types
const TARIFF_TYPES = {
  NORMAL: 'normal',
  TOU: 'tou',
  TOD: 'tod'
};

// Calculation types
const CALCULATION_TYPES = {
  TYPE_2: 'type-2',
  TYPE_3: 'type-3',
  TYPE_4: 'type-4',
  TYPE_5: 'type-5'
};

// Providers
const PROVIDERS = {
  MEA: 'mea',
  PEA: 'pea'
};

module.exports = {
  VAT_RATE,
  PF_PENALTY_RATE,
  PF_THRESHOLD_FACTOR,
  MINIMUM_BILL_FACTOR,
  VOLTAGE_LEVELS,
  TARIFF_TYPES,
  CALCULATION_TYPES,
  PROVIDERS
};
