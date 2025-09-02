/**
 * Test Configuration for Strategy Pattern Test Suite
 * Centralized configuration for all test files
 */

module.exports = {
  // Test timeouts
  timeouts: {
    short: 5000,      // 5 seconds for simple tests
    medium: 10000,    // 10 seconds for integration tests
    long: 30000,      // 30 seconds for performance tests
    veryLong: 60000   // 60 seconds for load tests
  },

  // Test data constants
  testData: {
    // MEA test scenarios
    mea: {
      type2: {
        tou: {
          '<12kV': {
            onPeakKwh: 300,
            offPeakKwh: 700,
            expectedStrategy: 'MEA_2.2.1_small_TOU',
            expectedAmount: 3618.58
          },
          '12-24kV': {
            onPeakKwh: 300,
            offPeakKwh: 700,
            expectedStrategy: 'MEA_2.2.2_small_TOU',
            expectedAmount: 3588.58
          }
        }
      },
      type3: {
        normal: {
          '<12kV': {
            kwh: 1500,
            demand: 75,
            expectedStrategy: 'MEA_3.1.1_medium_normal'
          },
          '12-24kV': {
            kwh: 1500,
            demand: 75,
            expectedStrategy: 'MEA_3.1.2_medium_normal'
          },
          '>=69kV': {
            kwh: 1500,
            demand: 75,
            expectedStrategy: 'MEA_3.1.3_medium_normal'
          }
        },
        tou: {
          '<12kV': {
            onPeakKwh: 500,
            offPeakKwh: 1000,
            demand: 100,
            expectedStrategy: 'MEA_3.2.1_medium_TOU'
          },
          '12-24kV': {
            onPeakKwh: 500,
            offPeakKwh: 1000,
            demand: 100,
            expectedStrategy: 'MEA_3.2.2_medium_TOU'
          },
          '>=69kV': {
            onPeakKwh: 500,
            offPeakKwh: 1000,
            demand: 100,
            expectedStrategy: 'MEA_3.2.3_medium_TOU'
          }
        }
      },
      type4: {
        tod: {
          '<12kV': {
            peakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'MEA_4.1.1_large_TOD'
          },
          '12-24kV': {
            peakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'MEA_4.1.2_large_TOD'
          },
          '>=69kV': {
            peakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'MEA_4.1.3_large_TOD'
          }
        },
        tou: {
          '<12kV': {
            onPeakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'MEA_4.2.1_large_TOU'
          },
          '12-24kV': {
            onPeakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'MEA_4.2.2_large_TOU'
          },
          '>=69kV': {
            onPeakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'MEA_4.2.3_large_TOU'
          }
        }
      },
      type5: {
        normal: {
          '<12kV': {
            kwh: 5000,
            demand: 500,
            expectedStrategy: 'MEA_5.1.1_specific_normal'
          },
          '12-24kV': {
            kwh: 5000,
            demand: 500,
            expectedStrategy: 'MEA_5.1.2_specific_normal'
          },
          '>=69kV': {
            kwh: 5000,
            demand: 500,
            expectedStrategy: 'MEA_5.1.3_specific_normal'
          }
        },
        tou: {
          '<12kV': {
            onPeakKwh: 3000,
            offPeakKwh: 4000,
            demand: 500,
            expectedStrategy: 'MEA_5.2.1_specific_TOU'
          },
          '12-24kV': {
            onPeakKwh: 3000,
            offPeakKwh: 4000,
            demand: 500,
            expectedStrategy: 'MEA_5.2.2_specific_TOU'
          },
          '>=69kV': {
            onPeakKwh: 3000,
            offPeakKwh: 4000,
            demand: 500,
            expectedStrategy: 'MEA_5.2.3_specific_TOU'
          }
        }
      }
    },

    // PEA test scenarios
    pea: {
      type2: {
        tou: {
          '<12kV': {
            onPeakKwh: 300,
            offPeakKwh: 700,
            expectedStrategy: 'PEA_2.2.1_small_TOU',
            expectedAmount: 3618.58
          },
          '12-24kV': {
            onPeakKwh: 300,
            offPeakKwh: 700,
            expectedStrategy: 'PEA_2.2.2_small_TOU',
            expectedAmount: 3588.58
          }
        }
      },
      type3: {
        normal: {
          '<12kV': {
            kwh: 1500,
            demand: 75,
            expectedStrategy: 'PEA_3.1.1_medium_normal'
          },
          '12-24kV': {
            kwh: 1500,
            demand: 75,
            expectedStrategy: 'PEA_3.1.2_medium_normal'
          },
          '>=69kV': {
            kwh: 1500,
            demand: 75,
            expectedStrategy: 'PEA_3.1.3_medium_normal'
          }
        },
        tou: {
          '<12kV': {
            onPeakKwh: 500,
            offPeakKwh: 1000,
            demand: 100,
            expectedStrategy: 'PEA_3.2.1_medium_TOU'
          },
          '12-24kV': {
            onPeakKwh: 500,
            offPeakKwh: 1000,
            demand: 100,
            expectedStrategy: 'PEA_3.2.2_medium_TOU'
          },
          '>=69kV': {
            onPeakKwh: 500,
            offPeakKwh: 1000,
            demand: 100,
            expectedStrategy: 'PEA_3.2.3_medium_TOU'
          }
        }
      },
      type4: {
        tod: {
          '<12kV': {
            peakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'PEA_4.1.1_large_TOD'
          },
          '12-24kV': {
            peakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'PEA_4.1.2_large_TOD'
          },
          '>=69kV': {
            peakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'PEA_4.1.3_large_TOD'
          }
        },
        tou: {
          '<12kV': {
            onPeakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'PEA_4.2.1_large_TOU'
          },
          '12-24kV': {
            onPeakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'PEA_4.2.2_large_TOU'
          },
          '>=69kV': {
            onPeakKwh: 2000,
            offPeakKwh: 3000,
            demand: 200,
            expectedStrategy: 'PEA_4.2.3_large_TOU'
          }
        }
      },
      type5: {
        tou: {
          '<12kV': {
            onPeakKwh: 3000,
            offPeakKwh: 4000,
            demand: 500,
            expectedStrategy: 'PEA_5.1.1_specific_TOU'
          },
          '12-24kV': {
            onPeakKwh: 3000,
            offPeakKwh: 4000,
            demand: 500,
            expectedStrategy: 'PEA_5.1.2_specific_TOU'
          },
          '>=69kV': {
            onPeakKwh: 3000,
            offPeakKwh: 4000,
            demand: 500,
            expectedStrategy: 'PEA_5.1.3_specific_TOU'
          }
        }
      }
    }
  },

  // Validation test data
  validation: {
    invalidTariffTypes: ['invalid', 'unknown', 'test'],
    invalidVoltageLevels: ['invalid', 'unknown', 'test', 'unsupported'],
    negativeValues: [-1, -100, -1000, -999999],
    zeroValues: [0, 0.0],
    excessiveValues: [Number.MAX_SAFE_INTEGER, 999999999, 1000000000],
    invalidDataTypes: ['abc', 'test', 'invalid', null, undefined],
    mixedDataTypes: {
      valid: ['300', '700', '1000'],
      invalid: ['abc', 'test', 'invalid']
    }
  },

  // Performance test configuration
  performance: {
    concurrentRequests: {
      small: 5,
      medium: 10,
      large: 20,
      stress: 50
    },
    responseTimeThresholds: {
      fast: 100,      // 100ms
      normal: 500,    // 500ms
      slow: 1000,     // 1 second
      verySlow: 5000  // 5 seconds
    },
    consistencyThreshold: 0.5 // 50% variance allowed
  },

  // Error message patterns
  errorMessages: {
    validation: {
      required: 'required',
      invalid: 'Invalid',
      notAllowed: 'not allowed',
      exceeds: 'exceeds',
      mustBePositive: 'must be positive',
      mustBeGreaterThan: 'must be greater than'
    },
    businessLogic: {
      unsupportedCalculationType: 'Unsupported Calculation Type',
      unsupportedTariffType: 'Unsupported Tariff Type',
      strategySelectionError: 'Strategy Selection Error',
      calculationError: 'Calculation Error'
    }
  },

  // API response patterns
  apiResponses: {
    success: {
      success: true,
      data: expect.any(Object)
    },
    error: {
      success: false,
      error: expect.any(String),
      message: expect.any(String)
    },
    validationError: {
      success: false,
      error: 'Validation Error',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: expect.any(String),
          message: expect.any(String)
        })
      ])
    }
  }
};
