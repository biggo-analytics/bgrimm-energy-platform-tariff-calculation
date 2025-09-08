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

    const { tariffType, voltageLevel } = data;

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

    return true;
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
