/**
 * Common Strategy Interface for Electricity Calculation Strategies
 * Defines the contract that all strategy classes must implement
 */

class ICalculationStrategy {
  /**
   * Constructor for strategy classes
   * @param {Object} rates - Rate configuration for this specific strategy
   * @param {number} serviceCharge - Service charge amount
   */
  constructor(rates, serviceCharge = null) {
    this.rates = rates;
    this.serviceCharge = serviceCharge;
  }

  /**
   * Main calculation method - must be implemented by all strategy classes
   * @param {Object} data - Input data for calculation
   * @returns {Object} - Calculation result
   * @throws {Error} - Must be implemented by concrete classes
   */
  calculate(data) {
    throw new Error('calculate method must be implemented by concrete strategy classes');
  }

  /**
   * Get the provider name (MEA or PEA)
   * @returns {string} - Provider name
   * @throws {Error} - Must be implemented by concrete classes
   */
  getProvider() {
    throw new Error('getProvider method must be implemented by concrete strategy classes');
  }

  /**
   * Get the calculation type (e.g., "2.2.1", "3.1.1")
   * @returns {string} - Calculation type identifier
   * @throws {Error} - Must be implemented by concrete classes
   */
  getCalculationType() {
    throw new Error('getCalculationType method must be implemented by concrete strategy classes');
  }

  /**
   * Get the tariff model (normal, tou, tod)
   * @returns {string} - Tariff model
   * @throws {Error} - Must be implemented by concrete classes
   */
  getTariffModel() {
    throw new Error('getTariffModel method must be implemented by concrete strategy classes');
  }

  /**
   * Get the voltage level (e.g., "<12kV", "22-33kV")
   * @returns {string} - Voltage level
   * @throws {Error} - Must be implemented by concrete classes
   */
  getVoltageLevel() {
    throw new Error('getVoltageLevel method must be implemented by concrete strategy classes');
  }

  /**
   * Get the customer size category (small, medium, large, specific)
   * @returns {string} - Customer size category
   * @throws {Error} - Must be implemented by concrete classes
   */
  getCustomerSize() {
    throw new Error('getCustomerSize method must be implemented by concrete strategy classes');
  }

  /**
   * Validate input data for this specific strategy
   * @param {Object} data - Input data to validate
   * @returns {boolean} - True if valid
   * @throws {Error} - If validation fails
   */
  validateInput(data) {
    if (!data) {
      throw new Error('Input data is required');
    }

    const { tariffType, voltageLevel, usage } = data;

    if (!tariffType) {
      throw new Error('Tariff type is required');
    }

    if (!voltageLevel) {
      throw new Error('Voltage level is required');
    }

    if (tariffType !== this.getTariffModel()) {
      throw new Error(`Tariff type mismatch. Expected ${this.getTariffModel()}, got ${tariffType}`);
    }

    if (voltageLevel !== this.getVoltageLevel()) {
      throw new Error(`Voltage level mismatch. Expected ${this.getVoltageLevel()}, got ${voltageLevel}`);
    }

    // Validate usage field exists
    if (!usage) {
      throw new Error('Missing required field: usage. This field is mandatory for the calculation.');
    }

    // Validate other required fields
    this.validateOtherFields(data);

    // Validate usage fields based on calculation type and tariff type
    this.validateUsageFields(data);

    return true;
  }

  /**
   * Validate other required fields common to all strategies
   * Can be overridden by specific strategies if needed
   * @param {Object} data - Input data for validation
   * @throws {Error} - If validation fails
   */
  validateOtherFields(data) {
    const { ftRateSatang } = data;
    const calculationType = this.getCalculationType();

    // Get the base calculation type (e.g., "2" from "2.2.1")
    const baseType = calculationType.split('.')[0];

    // ftRateSatang is required for all calculation types
    if (ftRateSatang === undefined || ftRateSatang === null) {
      throw new Error('Missing required field: ftRateSatang. This field is mandatory for the calculation.');
    }

    // Validate ftRateSatang is a number and non-negative
    if (typeof ftRateSatang !== 'number' || ftRateSatang < 0) {
      throw new Error('ftRateSatang must be a non-negative number');
    }

    // Additional fields for types 3, 4, 5
    if (baseType === '3' || baseType === '4' || baseType === '5') {
      const { peakKvar, highestDemandChargeLast12m } = data;

      if (peakKvar === undefined || peakKvar === null) {
        throw new Error('Missing required field: peakKvar. This field is mandatory for calculation types 3, 4, and 5.');
      }

      if (typeof peakKvar !== 'number' || peakKvar < 0) {
        throw new Error('peakKvar must be a non-negative number');
      }

      if (highestDemandChargeLast12m === undefined || highestDemandChargeLast12m === null) {
        throw new Error('Missing required field: highestDemandChargeLast12m. This field is mandatory for calculation types 3, 4, and 5.');
      }

      if (typeof highestDemandChargeLast12m !== 'number' || highestDemandChargeLast12m < 0) {
        throw new Error('highestDemandChargeLast12m must be a non-negative number');
      }
    }
  }

  /**
   * Validate usage fields based on calculation type and tariff type
   * Can be overridden by specific strategies if needed
   * @param {Object} data - Input data for validation
   * @throws {Error} - If validation fails
   */
  validateUsageFields(data) {
    const { usage, tariffType } = data;
    const calculationType = this.getCalculationType();

    // Get the base calculation type (e.g., "2" from "2.2.1")
    const baseType = calculationType.split('.')[0];

    if (baseType === '2') {
      if (tariffType === 'normal') {
        if (usage.total_kwh === undefined || usage.total_kwh === null) {
          throw new Error('Missing required field: total_kwh');
        }
        if (typeof usage.total_kwh !== 'number' || usage.total_kwh < 0) {
          throw new Error('total_kwh must be a non-negative number');
        }
      } else if (tariffType === 'tou') {
        if (usage.on_peak_kwh === undefined || usage.on_peak_kwh === null) {
          throw new Error('Missing required field: on_peak_kwh');
        }
        if (typeof usage.on_peak_kwh !== 'number' || usage.on_peak_kwh < 0) {
          throw new Error('on_peak_kwh must be a non-negative number');
        }
        if (usage.off_peak_kwh === undefined || usage.off_peak_kwh === null) {
          throw new Error('Missing required field: off_peak_kwh');
        }
        if (typeof usage.off_peak_kwh !== 'number' || usage.off_peak_kwh < 0) {
          throw new Error('off_peak_kwh must be a non-negative number');
        }
      }
    } else if (baseType === '3' || baseType === '5') {
      if (tariffType === 'normal') {
        if (usage.peak_kw === undefined || usage.peak_kw === null) {
          throw new Error('Missing required field: peak_kw');
        }
        if (typeof usage.peak_kw !== 'number' || usage.peak_kw < 0) {
          throw new Error('peak_kw must be a non-negative number');
        }
        if (usage.total_kwh === undefined || usage.total_kwh === null) {
          throw new Error('Missing required field: total_kwh');
        }
        if (typeof usage.total_kwh !== 'number' || usage.total_kwh < 0) {
          throw new Error('total_kwh must be a non-negative number');
        }
      } else if (tariffType === 'tou') {
        if (usage.on_peak_kw === undefined || usage.on_peak_kw === null) {
          throw new Error('Missing required field: on_peak_kw');
        }
        if (typeof usage.on_peak_kw !== 'number' || usage.on_peak_kw < 0) {
          throw new Error('on_peak_kw must be a non-negative number');
        }
        if (usage.on_peak_kwh === undefined || usage.on_peak_kwh === null) {
          throw new Error('Missing required field: on_peak_kwh');
        }
        if (typeof usage.on_peak_kwh !== 'number' || usage.on_peak_kwh < 0) {
          throw new Error('on_peak_kwh must be a non-negative number');
        }
        if (usage.off_peak_kw === undefined || usage.off_peak_kw === null) {
          throw new Error('Missing required field: off_peak_kw');
        }
        if (typeof usage.off_peak_kw !== 'number' || usage.off_peak_kw < 0) {
          throw new Error('off_peak_kw must be a non-negative number');
        }
        if (usage.off_peak_kwh === undefined || usage.off_peak_kwh === null) {
          throw new Error('Missing required field: off_peak_kwh');
        }
        if (typeof usage.off_peak_kwh !== 'number' || usage.off_peak_kwh < 0) {
          throw new Error('off_peak_kwh must be a non-negative number');
        }
      }
    } else if (baseType === '4') {
      if (tariffType === 'tod') {
        if (usage.on_peak_kw === undefined || usage.on_peak_kw === null) {
          throw new Error('Missing required field: on_peak_kw');
        }
        if (typeof usage.on_peak_kw !== 'number' || usage.on_peak_kw < 0) {
          throw new Error('on_peak_kw must be a non-negative number');
        }
        if (usage.partial_peak_kw === undefined || usage.partial_peak_kw === null) {
          throw new Error('Missing required field: partial_peak_kw');
        }
        if (typeof usage.partial_peak_kw !== 'number' || usage.partial_peak_kw < 0) {
          throw new Error('partial_peak_kw must be a non-negative number');
        }
        if (usage.off_peak_kw === undefined || usage.off_peak_kw === null) {
          throw new Error('Missing required field: off_peak_kw');
        }
        if (typeof usage.off_peak_kw !== 'number' || usage.off_peak_kw < 0) {
          throw new Error('off_peak_kw must be a non-negative number');
        }
        if (usage.total_kwh === undefined || usage.total_kwh === null) {
          throw new Error('Missing required field: total_kwh');
        }
        if (typeof usage.total_kwh !== 'number' || usage.total_kwh < 0) {
          throw new Error('total_kwh must be a non-negative number');
        }
      } else if (tariffType === 'tou') {
        if (usage.on_peak_kw === undefined || usage.on_peak_kw === null) {
          throw new Error('Missing required field: on_peak_kw');
        }
        if (typeof usage.on_peak_kw !== 'number' || usage.on_peak_kw < 0) {
          throw new Error('on_peak_kw must be a non-negative number');
        }
        if (usage.on_peak_kwh === undefined || usage.on_peak_kwh === null) {
          throw new Error('Missing required field: on_peak_kwh');
        }
        if (typeof usage.on_peak_kwh !== 'number' || usage.on_peak_kwh < 0) {
          throw new Error('on_peak_kwh must be a non-negative number');
        }
        if (usage.off_peak_kw === undefined || usage.off_peak_kw === null) {
          throw new Error('Missing required field: off_peak_kw');
        }
        if (typeof usage.off_peak_kw !== 'number' || usage.off_peak_kw < 0) {
          throw new Error('off_peak_kw must be a non-negative number');
        }
        if (usage.off_peak_kwh === undefined || usage.off_peak_kwh === null) {
          throw new Error('Missing required field: off_peak_kwh');
        }
        if (typeof usage.off_peak_kwh !== 'number' || usage.off_peak_kwh < 0) {
          throw new Error('off_peak_kwh must be a non-negative number');
        }
      }
    }
  }

  /**
   * Get strategy identifier string
   * @returns {string} - Strategy identifier in format "PROVIDER_TYPE.SUBTYPE.VOLTAGE_SIZE_MODEL"
   */
  getStrategyId() {
    return `${this.getProvider()}_${this.getCalculationType()}_${this.getCustomerSize()}_${this.getTariffModel()}`;
  }

  /**
   * Get strategy description
   * @returns {string} - Human-readable strategy description
   */
  getDescription() {
    return `${this.getProvider()} ${this.getCalculationType()} ${this.getCustomerSize()} ${this.getTariffModel().toUpperCase()} (${this.getVoltageLevel()})`;
  }
}

module.exports = ICalculationStrategy;
