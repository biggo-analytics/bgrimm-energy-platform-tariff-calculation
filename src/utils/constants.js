/**
 * Shared Constants for Electricity Billing Calculations
 * 
 * This file contains all constants used across MEA and PEA electricity calculations.
 * These values are based on regulatory requirements and should only be updated
 * when official rates change.
 * 
 * Last updated: Based on current regulatory framework
 * Next review: Should be reviewed when new regulations are published
 */

// ============================================================================
// TAX AND REGULATORY RATES
// ============================================================================

/**
 * Value Added Tax rate for electricity services in Thailand
 * Applied to total bill amount before VAT as per Thai tax law
 */
const VAT_RATE = 0.07; // 7%

/**
 * Power factor penalty rate per kVAR per month
 * Applied when reactive power exceeds 61.97% of active power
 * Encourages customers to maintain good power factor
 */
const POWER_FACTOR_PENALTY_RATE_BAHT_PER_KVAR = 56.07; // Baht per kVAR per month

/**
 * Power factor threshold as a ratio of reactive to active power
 * When kVAR exceeds (kW * 0.6197), penalty charges apply
 * Equivalent to power factor of approximately 0.85
 */
const POWER_FACTOR_THRESHOLD_RATIO = 0.6197; // 61.97%

/**
 * Minimum bill protection factor for demand charges
 * Ensures demand charge doesn't fall below 70% of highest charge in last 12 months
 * Provides billing stability for customers and revenue protection for utilities
 */
const MINIMUM_DEMAND_CHARGE_PROTECTION_FACTOR = 0.70; // 70%

// ============================================================================
// VOLTAGE LEVEL CLASSIFICATIONS
// ============================================================================

/**
 * Voltage level classifications for different electricity providers
 * These determine applicable rate structures and service charges
 */
const VOLTAGE_LEVELS = {
  // PEA (Provincial Electricity Authority) voltage classifications
  PEA_LOW_VOLTAGE: '<22kV',        // Low voltage distribution
  PEA_MEDIUM_VOLTAGE: '22-33kV',   // Medium voltage distribution  
  PEA_HIGH_VOLTAGE: '>=69kV',      // High voltage transmission
  
  // MEA (Metropolitan Electricity Authority) voltage classifications
  MEA_LOW_VOLTAGE: '<12kV',        // Low voltage distribution (urban)
  MEA_MEDIUM_VOLTAGE: '12-24kV',   // Medium voltage distribution (urban)
  MEA_HIGH_VOLTAGE: '>=69kV',      // High voltage transmission
  
  // Legacy naming for backward compatibility
  LOW: '<22kV',
  MEDIUM: '22-33kV', 
  HIGH: '>=69kV',
  MEA_LOW: '<12kV',
  MEA_MEDIUM: '12-24kV',
  MEA_HIGH: '>=69kV'
};

// ============================================================================
// TARIFF TYPE CLASSIFICATIONS
// ============================================================================

/**
 * Available tariff types for electricity billing
 * Each type has different rate structures and applicable customer categories
 */
const TARIFF_TYPES = {
  NORMAL: 'normal',   // Standard fixed-rate tariff
  TOU: 'tou',        // Time of Use - different rates for peak/off-peak hours
  TOD: 'tod'         // Time of Day - three-tier demand pricing (Type 4 only)
};

// ============================================================================
// CUSTOMER CALCULATION TYPE CLASSIFICATIONS  
// ============================================================================

/**
 * Customer types based on size and usage patterns
 * Each type has different calculation methods and rate structures
 */
const CUSTOMER_CALCULATION_TYPES = {
  SMALL_GENERAL_SERVICE: 'type-2',      // Small businesses, residential
  MEDIUM_GENERAL_SERVICE: 'type-3',     // Medium businesses
  LARGE_GENERAL_SERVICE: 'type-4',      // Large businesses, industrial
  SPECIFIC_BUSINESS_SERVICE: 'type-5',  // Specific business categories
  
  // Legacy naming for backward compatibility
  TYPE_2: 'type-2',
  TYPE_3: 'type-3', 
  TYPE_4: 'type-4',
  TYPE_5: 'type-5'
};

// ============================================================================
// ELECTRICITY PROVIDER IDENTIFIERS
// ============================================================================

/**
 * Electricity utility providers in Thailand
 */
const ELECTRICITY_PROVIDERS = {
  MEA: 'mea',  // Metropolitan Electricity Authority (Bangkok and surrounding areas)
  PEA: 'pea'   // Provincial Electricity Authority (Provincial areas)
};

// ============================================================================
// BILLING PRECISION CONSTANTS
// ============================================================================

/**
 * Decimal precision levels for different billing components
 * Ensures consistent rounding across all calculations
 */
const BILLING_PRECISION = {
  STANDARD_CHARGES: 3,        // Energy, base tariff (0.001 Baht)
  FINAL_AMOUNTS: 5,          // VAT, total bills (0.00001 Baht)
  DEMAND_CHARGES: 1,         // Large demand amounts (0.1 Baht)
  PENALTY_CHARGES: 3         // Power factor penalties (0.001 Baht)
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Tax and regulatory rates
  VAT_RATE,
  POWER_FACTOR_PENALTY_RATE_BAHT_PER_KVAR,
  POWER_FACTOR_THRESHOLD_RATIO,
  MINIMUM_DEMAND_CHARGE_PROTECTION_FACTOR,
  
  // Legacy naming for backward compatibility
  PF_PENALTY_RATE: POWER_FACTOR_PENALTY_RATE_BAHT_PER_KVAR,
  PF_THRESHOLD_FACTOR: POWER_FACTOR_THRESHOLD_RATIO,
  MINIMUM_BILL_FACTOR: MINIMUM_DEMAND_CHARGE_PROTECTION_FACTOR,
  
  // Classifications
  VOLTAGE_LEVELS,
  TARIFF_TYPES,
  CUSTOMER_CALCULATION_TYPES,
  ELECTRICITY_PROVIDERS,
  BILLING_PRECISION,
  
  // Legacy naming for backward compatibility
  CALCULATION_TYPES: CUSTOMER_CALCULATION_TYPES,
  PROVIDERS: ELECTRICITY_PROVIDERS
};
