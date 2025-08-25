/**
 * Test Utilities and Helpers
 * Common functions for electricity calculation tests
 */

const request = require('supertest');

/**
 * Test data constants for consistent testing
 */
const TEST_CONSTANTS = {
  // FT Rates (satang per kWh)
  FT_RATES: {
    MEA: [0, 19.72, 25.0, 50.0, 100.0],
    PEA: [0, 39.72, 50.0, 75.0, 100.0]
  },
  
  // Consumption levels (kWh)
  CONSUMPTION_LEVELS: {
    MINIMAL: [0.1, 1, 10],
    LOW: [50, 100, 150],
    MEDIUM: [200, 300, 400, 500],
    HIGH: [750, 1000, 1500],
    VERY_HIGH: [5000, 10000, 50000]
  },
  
  // Voltage levels by provider
  VOLTAGE_LEVELS: {
    MEA: ['<12kV', '12-24kV', '>=69kV'],
    PEA: ['<22kV', '22-33kV', '>=69kV']
  },
  
  // Tariff types by calculation type
  TARIFF_TYPES: {
    TYPE_2: ['normal', 'tou'],
    TYPE_3: ['normal', 'tou'],
    TYPE_4: ['tod', 'tou'],
    TYPE_5: ['normal', 'tou']
  }
};

/**
 * Generate test data for normal tariff calculations
 * @param {string} provider - 'mea' or 'pea'
 * @param {string} voltageLevel - voltage level
 * @param {number} ftRateSatang - FT rate in satang
 * @param {number} totalKwh - total consumption in kWh
 * @returns {Object} test data object
 */
const generateNormalTariffData = (provider, voltageLevel, ftRateSatang, totalKwh) => ({
  tariffType: 'normal',
  voltageLevel,
  ftRateSatang,
  usage: {
    total_kwh: totalKwh
  }
});

/**
 * Generate test data for TOU tariff calculations
 * @param {string} provider - 'mea' or 'pea'
 * @param {string} voltageLevel - voltage level
 * @param {number} ftRateSatang - FT rate in satang
 * @param {number} onPeakKwh - on-peak consumption in kWh
 * @param {number} offPeakKwh - off-peak consumption in kWh
 * @returns {Object} test data object
 */
const generateTOUTariffData = (provider, voltageLevel, ftRateSatang, onPeakKwh, offPeakKwh) => ({
  tariffType: 'tou',
  voltageLevel,
  ftRateSatang,
  usage: {
    on_peak_kwh: onPeakKwh,
    off_peak_kwh: offPeakKwh
  }
});

/**
 * Generate test data for TOD tariff calculations (Type 4 only)
 * @param {string} provider - 'mea' or 'pea'
 * @param {string} voltageLevel - voltage level
 * @param {number} ftRateSatang - FT rate in satang
 * @param {Object} usage - usage object with peak, off-peak, and night values
 * @returns {Object} test data object
 */
const generateTODTariffData = (provider, voltageLevel, ftRateSatang, usage) => ({
  tariffType: 'tod',
  voltageLevel,
  ftRateSatang,
  usage
});

/**
 * Create a test server instance
 * @param {Object} app - Koa app instance
 * @returns {Object} server instance
 */
const createTestServer = (app) => {
  return app.listen(0); // Use random port
};

/**
 * Close test server
 * @param {Object} server - server instance
 * @returns {Promise} promise that resolves when server is closed
 */
const closeTestServer = (server) => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
};

/**
 * Make API request with error handling
 * @param {Object} server - test server instance
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object} data - request body
 * @returns {Promise<Object>} response object
 */
const makeApiRequest = async (server, method, url, data = null) => {
  try {
    const req = request(server)[method.toLowerCase()](url);
    if (data) {
      req.send(data);
    }
    return await req;
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
};

/**
 * Validate calculation response structure
 * @param {Object} response - API response object
 * @param {boolean} expectServiceCharge - whether to expect service charge
 */
const validateCalculationResponse = (response, expectServiceCharge = true) => {
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('energyCharge');
  expect(response.body).toHaveProperty('baseTariff');
  expect(response.body).toHaveProperty('ftCharge');
  expect(response.body).toHaveProperty('vat');
  expect(response.body).toHaveProperty('totalBill');
  
  if (expectServiceCharge) {
    expect(response.body).toHaveProperty('serviceCharge');
  }
  
  // Validate data types
  expect(typeof response.body.energyCharge).toBe('number');
  expect(typeof response.body.baseTariff).toBe('number');
  expect(typeof response.body.ftCharge).toBe('number');
  expect(typeof response.body.vat).toBe('number');
  expect(typeof response.body.totalBill).toBe('number');
  
  if (expectServiceCharge) {
    expect(typeof response.body.serviceCharge).toBe('number');
  }
};

/**
 * Validate error response structure
 * @param {Object} response - API response object
 * @param {number} expectedStatus - expected HTTP status code
 * @param {string} expectedError - expected error message (optional)
 */
const validateErrorResponse = (response, expectedStatus = 400, expectedError = null) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('error');
  expect(typeof response.body.error).toBe('string');
  
  if (expectedError) {
    expect(response.body.error).toBe(expectedError);
  }
};

/**
 * Calculate expected energy charge for normal tariff (Type 2)
 * @param {number} totalKwh - total consumption in kWh
 * @param {string} voltageLevel - voltage level
 * @returns {number} expected energy charge
 */
const calculateExpectedEnergyChargeNormal = (totalKwh, voltageLevel) => {
  // Type 2 rates (same for MEA and PEA)
  const rates = {
    '<12kV': [3.2484, 4.2218, 4.4217],
    '<22kV': [3.2484, 4.2218, 4.4217],
    '12-24kV': [3.9086, 4.2218, 4.4217],
    '22-33kV': [3.9086, 4.2218, 4.4217],
    '>=69kV': [3.9086, 4.2218, 4.4217]
  };
  
  const rate = rates[voltageLevel] || rates['<22kV'];
  const thresholds = [0, 150, 400];
  
  let charge = 0;
  let remainingKwh = totalKwh;
  
  for (let i = 0; i < thresholds.length && remainingKwh > 0; i++) {
    const threshold = thresholds[i];
    const nextThreshold = thresholds[i + 1] || Infinity;
    const tierKwh = Math.min(remainingKwh, nextThreshold - threshold);
    
    if (tierKwh > 0) {
      charge += tierKwh * rate[i];
      remainingKwh -= tierKwh;
    }
  }
  
  return charge;
};

/**
 * Calculate expected energy charge for TOU tariff (Type 2)
 * @param {number} onPeakKwh - on-peak consumption in kWh
 * @param {number} offPeakKwh - off-peak consumption in kWh
 * @param {string} voltageLevel - voltage level
 * @returns {number} expected energy charge
 */
const calculateExpectedEnergyChargeTOU = (onPeakKwh, offPeakKwh, voltageLevel) => {
  // Type 2 TOU rates
  const rates = {
    '<12kV': { onPeak: 5.7982, offPeak: 2.6369 },
    '<22kV': { onPeak: 5.7982, offPeak: 2.6369 },
    '12-24kV': { onPeak: 5.7982, offPeak: 2.6369 },
    '22-33kV': { onPeak: 5.7982, offPeak: 2.6369 },
    '>=69kV': { onPeak: 5.7982, offPeak: 2.6369 }
  };
  
  const rate = rates[voltageLevel] || rates['<22kV'];
  return (onPeakKwh * rate.onPeak) + (offPeakKwh * rate.offPeak);
};

/**
 * Calculate expected FT charge
 * @param {number} totalKwh - total consumption in kWh
 * @param {number} ftRateSatang - FT rate in satang
 * @returns {number} expected FT charge
 */
const calculateExpectedFTCharge = (totalKwh, ftRateSatang) => {
  return (totalKwh * ftRateSatang) / 100;
};

/**
 * Calculate expected VAT
 * @param {number} baseTariff - base tariff amount
 * @param {number} ftCharge - FT charge amount
 * @returns {number} expected VAT
 */
const calculateExpectedVAT = (baseTariff, ftCharge) => {
  return (baseTariff + ftCharge) * 0.07;
};

/**
 * Generate comprehensive test scenarios
 * @param {string} provider - 'mea' or 'pea'
 * @param {string} calculationType - 'type-2', 'type-3', etc.
 * @returns {Array} array of test scenarios
 */
const generateTestScenarios = (provider, calculationType) => {
  const scenarios = [];
  const voltageLevels = TEST_CONSTANTS.VOLTAGE_LEVELS[provider.toUpperCase()];
  const tariffTypes = TEST_CONSTANTS.TARIFF_TYPES[calculationType.toUpperCase().replace('-', '_')];
  const ftRates = TEST_CONSTANTS.FT_RATES[provider.toUpperCase()];
  const consumptionLevels = TEST_CONSTANTS.CONSUMPTION_LEVELS.MEDIUM;
  
  // Generate normal tariff scenarios
  if (tariffTypes.includes('normal')) {
    for (const voltageLevel of voltageLevels) {
      for (const ftRate of ftRates) {
        for (const consumption of consumptionLevels) {
          scenarios.push({
            name: `${provider} ${calculationType} normal - ${voltageLevel} - ${consumption}kWh - FT${ftRate}`,
            data: generateNormalTariffData(provider, voltageLevel, ftRate, consumption),
            expectedStatus: 200
          });
        }
      }
    }
  }
  
  // Generate TOU tariff scenarios
  if (tariffTypes.includes('tou')) {
    for (const voltageLevel of voltageLevels) {
      for (const ftRate of ftRates) {
        scenarios.push({
          name: `${provider} ${calculationType} TOU - ${voltageLevel} - FT${ftRate}`,
          data: generateTOUTariffData(provider, voltageLevel, ftRate, 200, 300),
          expectedStatus: 200
        });
      }
    }
  }
  
  return scenarios;
};

/**
 * Generate error test scenarios
 * @param {string} provider - 'mea' or 'pea'
 * @param {string} calculationType - 'type-2', 'type-3', etc.
 * @returns {Array} array of error test scenarios
 */
const generateErrorTestScenarios = (provider, calculationType) => {
  const scenarios = [];
  const baseData = generateNormalTariffData(provider, '<22kV', 39.72, 500);
  
  // Missing fields
  scenarios.push({
    name: 'Missing request body',
    data: null,
    expectedStatus: 400,
    expectedError: 'Request body is required'
  });
  
  scenarios.push({
    name: 'Missing tariffType',
    data: { ...baseData, tariffType: undefined },
    expectedStatus: 400,
    expectedError: 'Missing required field: tariffType'
  });
  
  scenarios.push({
    name: 'Missing voltageLevel',
    data: { ...baseData, voltageLevel: undefined },
    expectedStatus: 400,
    expectedError: 'Missing required field: voltageLevel'
  });
  
  scenarios.push({
    name: 'Missing ftRateSatang',
    data: { ...baseData, ftRateSatang: undefined },
    expectedStatus: 400,
    expectedError: 'Missing required field: ftRateSatang'
  });
  
  scenarios.push({
    name: 'Missing usage',
    data: { ...baseData, usage: undefined },
    expectedStatus: 400,
    expectedError: 'Missing required field: usage'
  });
  
  // Invalid values
  scenarios.push({
    name: 'Invalid tariff type',
    data: { ...baseData, tariffType: 'invalid' },
    expectedStatus: 400,
    expectedError: `Invalid tariff type for ${calculationType.replace('type-', 'Type ')}. Must be "normal" or "tou", received: invalid`
  });
  
  scenarios.push({
    name: 'Invalid voltage level',
    data: { ...baseData, voltageLevel: 'invalid' },
    expectedStatus: 400,
    expectedError: `Invalid voltage level for ${calculationType.replace('type-', 'Type ')} normal. Must be ">=69kV", "22-33kV", or "<22kV", received: invalid`
  });
  
  // Invalid data types
  scenarios.push({
    name: 'String ftRateSatang',
    data: { ...baseData, ftRateSatang: 'invalid' },
    expectedStatus: 400
  });
  
  scenarios.push({
    name: 'String total_kwh',
    data: { ...baseData, usage: { total_kwh: 'invalid' } },
    expectedStatus: 400
  });
  
  return scenarios;
};

/**
 * Run a test scenario
 * @param {Object} server - test server instance
 * @param {string} url - API endpoint
 * @param {Object} scenario - test scenario object
 * @returns {Promise<Object>} test result
 */
const runTestScenario = async (server, url, scenario) => {
  const response = await makeApiRequest(server, 'POST', url, scenario.data);
  
  if (scenario.expectedStatus === 200) {
    validateCalculationResponse(response);
  } else {
    validateErrorResponse(response, scenario.expectedStatus, scenario.expectedError);
  }
  
  return response;
};

module.exports = {
  TEST_CONSTANTS,
  generateNormalTariffData,
  generateTOUTariffData,
  generateTODTariffData,
  createTestServer,
  closeTestServer,
  makeApiRequest,
  validateCalculationResponse,
  validateErrorResponse,
  calculateExpectedEnergyChargeNormal,
  calculateExpectedEnergyChargeTOU,
  calculateExpectedFTCharge,
  calculateExpectedVAT,
  generateTestScenarios,
  generateErrorTestScenarios,
  runTestScenario
};
