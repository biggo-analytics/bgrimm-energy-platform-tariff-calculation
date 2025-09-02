/**
 * Strategy Pattern Test Suite Index
 * Main entry point for all strategy pattern tests
 */

// Import test configuration
const testConfig = require('./test-config');

// Import test suites
const meaStrategiesTests = require('./mea/mea-strategies.test');
const meaValidationErrorTests = require('./mea/mea-validation-error.test');
const peaStrategiesTests = require('./pea/pea-strategies.test');
const peaValidationErrorTests = require('./pea/pea-validation-error.test');
const apiIntegrationTests = require('./api-integration.test');

// Export test configuration for use in individual test files
module.exports = {
  testConfig,
  
  // Test suite modules
  testSuites: {
    mea: {
      strategies: meaStrategiesTests,
      validationError: meaValidationErrorTests
    },
    pea: {
      strategies: peaStrategiesTests,
      validationError: peaValidationErrorTests
    },
    integration: apiIntegrationTests
  },

  // Test categories
  categories: {
    unit: [
      'MEA Strategy Tests',
      'PEA Strategy Tests'
    ],
    validation: [
      'MEA Validation & Error Tests',
      'PEA Validation & Error Tests'
    ],
    integration: [
      'API Integration Tests'
    ],
    performance: [
      'Performance & Load Tests'
    ]
  },

  // Test execution helpers
  helpers: {
    // Get test data for specific provider and calculation type
    getTestData: (provider, calculationType, tariffType, voltageLevel) => {
      const providerData = testConfig.testData[provider.toLowerCase()];
      if (!providerData) return null;
      
      const typeData = providerData[`type${calculationType.split('-')[1]}`];
      if (!typeData) return null;
      
      const tariffData = typeData[tariffType];
      if (!tariffData) return null;
      
      return tariffData[voltageLevel] || null;
    },

    // Validate test response structure
    validateResponse: (response, expectedStructure) => {
      expect(response.body).toMatchObject(expectedStructure);
    },

    // Create test request data
    createRequestData: (tariffType, voltageLevel, params) => {
      const baseData = {
        tariffType,
        voltageLevel,
        ...params
      };
      
      return baseData;
    },

    // Test strategy selection
    testStrategySelection: async (server, endpoint, requestData, expectedStrategy) => {
      const response = await require('supertest')(server)
        .post(endpoint)
        .send(requestData)
        .expect(200);

      expect(response.body.data.strategyUsed).toBe(expectedStrategy);
      return response;
    },

    // Test validation error
    testValidationError: async (server, endpoint, requestData, expectedError) => {
      const response = await require('supertest')(server)
        .post(endpoint)
        .send(requestData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expectedError.error || 'Validation Error',
        ...expectedError
      });
      
      return response;
    },

    // Performance testing helper
    measurePerformance: async (testFunction, iterations = 5) => {
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await testFunction();
        const endTime = Date.now();
        times.push(endTime - startTime);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);
      
      return {
        times,
        average: avgTime,
        variance,
        stdDev,
        min: Math.min(...times),
        max: Math.max(...times)
      };
    },

    // Load testing helper
    loadTest: async (testFunction, concurrentRequests = 10) => {
      const startTime = Date.now();
      
      const promises = Array(concurrentRequests).fill().map(() => testFunction());
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      return {
        totalTime,
        concurrentRequests,
        results,
        averageTimePerRequest: totalTime / concurrentRequests
      };
    }
  },

  // Test utilities
  utilities: {
    // Mock data generators
    generateMockData: {
      mea: {
        type2: () => ({
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        }),
        type3: () => ({
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1500,
          demand: 75
        }),
        type4: () => ({
          tariffType: 'tod',
          voltageLevel: '<12kV',
          peakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        }),
        type5: () => ({
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 5000,
          demand: 500
        })
      },
      pea: {
        type2: () => ({
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        }),
        type3: () => ({
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1500,
          demand: 75
        }),
        type4: () => ({
          tariffType: 'tod',
          voltageLevel: '<12kV',
          peakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        }),
        type5: () => ({
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        })
      }
    },

    // Test data validators
    validateTestData: {
      // Validate MEA test data
      mea: (data) => {
        const required = ['tariffType', 'voltageLevel'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        
        // Validate tariff type
        const validTariffTypes = ['normal', 'tou', 'tod'];
        if (!validTariffTypes.includes(data.tariffType)) {
          throw new Error(`Invalid tariff type: ${data.tariffType}`);
        }
        
        // Validate voltage level
        const validVoltageLevels = ['<12kV', '12-24kV', '>=69kV'];
        if (!validVoltageLevels.includes(data.voltageLevel)) {
          throw new Error(`Invalid voltage level: ${data.voltageLevel}`);
        }
        
        return true;
      },

      // Validate PEA test data
      pea: (data) => {
        const required = ['tariffType', 'voltageLevel'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        
        // Validate tariff type
        const validTariffTypes = ['normal', 'tou', 'tod'];
        if (!validTariffTypes.includes(data.tariffType)) {
          throw new Error(`Invalid tariff type: ${data.tariffType}`);
        }
        
        // Validate voltage level
        const validVoltageLevels = ['<12kV', '12-24kV', '>=69kV'];
        if (!validVoltageLevels.includes(data.voltageLevel)) {
          throw new Error(`Invalid voltage level: ${data.voltageLevel}`);
        }
        
        return true;
      }
    }
  }
};

// Export individual test suites for direct import
module.exports.meaStrategiesTests = meaStrategiesTests;
module.exports.meaValidationErrorTests = meaValidationErrorTests;
module.exports.peaStrategiesTests = peaStrategiesTests;
module.exports.peaValidationErrorTests = peaValidationErrorTests;
module.exports.apiIntegrationTests = apiIntegrationTests;
