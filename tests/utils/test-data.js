/**
 * Test Data for Electricity Calculation Tests
 * Comprehensive test data sets for all providers and calculation types
 */

/**
 * MEA Test Data Sets
 */
const MEA_TEST_DATA = {
  TYPE_2: {
    NORMAL: {
      // Test cases with expected results
      '<12kV_500kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 500
          }
        },
        expected: {
          energyCharge: 1984.88,
          serviceCharge: 33.29,
          baseTariff: 2018.17,
          ftCharge: 98.60,
          vat: 148.17,
          totalBill: 2264.94
        }
      },
      '<12kV_150kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 150
          }
        },
        expected: {
          energyCharge: 487.26,
          serviceCharge: 33.29,
          baseTariff: 520.55,
          ftCharge: 29.58,
          vat: 38.51,
          totalBill: 588.64
        }
      },
      '<12kV_400kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 400
          }
        },
        expected: {
          energyCharge: 1542.71,
          serviceCharge: 33.29,
          baseTariff: 1576.00,
          ftCharge: 78.88,
          vat: 115.84,
          totalBill: 1770.72
        }
      },
      '12-24kV_1000kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '12-24kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 1000
          }
        },
        expected: {
          energyCharge: 3908.6,
          serviceCharge: 312.24,
          baseTariff: 4220.84,
          ftCharge: 197.2,
          vat: 309.26,
          totalBill: 4727.30
        }
      }
    },
    TOU: {
      '<12kV_200on_300off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            on_peak_kwh: 200,
            off_peak_kwh: 300
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 98.60,
          vat: 145.78,
          totalBill: 2228.38
        }
      },
      '<12kV_500on_0off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            on_peak_kwh: 500,
            off_peak_kwh: 0
          }
        },
        expected: {
          energyCharge: 2899.1,
          serviceCharge: 33.29,
          baseTariff: 2932.39,
          ftCharge: 98.60,
          vat: 212.17,
          totalBill: 3243.16
        }
      },
      '<12kV_0on_500off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            on_peak_kwh: 0,
            off_peak_kwh: 500
          }
        },
        expected: {
          energyCharge: 1318.45,
          serviceCharge: 33.29,
          baseTariff: 1351.74,
          ftCharge: 98.60,
          vat: 101.52,
          totalBill: 1551.86
        }
      }
    }
  },
  TYPE_3: {
    NORMAL: {
      '<12kV_500kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 500
          }
        },
        expected: {
          energyCharge: 1984.88,
          serviceCharge: 33.29,
          baseTariff: 2018.17,
          ftCharge: 98.60,
          vat: 148.17,
          totalBill: 2264.94
        }
      }
    },
    TOU: {
      '<12kV_200on_300off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            on_peak_kwh: 200,
            off_peak_kwh: 300
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 98.60,
          vat: 145.78,
          totalBill: 2228.38
        }
      }
    }
  },
  TYPE_4: {
    TOD: {
      '<12kV_peak_offpeak_night': {
        input: {
          tariffType: 'tod',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            peak_kwh: 100,
            off_peak_kwh: 200,
            night_kwh: 100
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 78.88,
          vat: 144.40,
          totalBill: 2207.28
        }
      }
    },
    TOU: {
      '<12kV_200on_300off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            on_peak_kwh: 200,
            off_peak_kwh: 300
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 98.60,
          vat: 145.78,
          totalBill: 2228.38
        }
      }
    }
  },
  TYPE_5: {
    NORMAL: {
      '<12kV_500kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 500
          }
        },
        expected: {
          energyCharge: 1984.88,
          serviceCharge: 33.29,
          baseTariff: 2018.17,
          ftCharge: 98.60,
          vat: 148.17,
          totalBill: 2264.94
        }
      }
    },
    TOU: {
      '<12kV_200on_300off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            on_peak_kwh: 200,
            off_peak_kwh: 300
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 98.60,
          vat: 145.78,
          totalBill: 2228.38
        }
      }
    }
  }
};

/**
 * PEA Test Data Sets
 */
const PEA_TEST_DATA = {
  TYPE_2: {
    NORMAL: {
      '<22kV_500kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            total_kwh: 500
          }
        },
        expected: {
          energyCharge: 1984.88,
          serviceCharge: 33.29,
          baseTariff: 2018.17,
          ftCharge: 198.60,
          vat: 155.17,
          totalBill: 2371.94
        }
      },
      '<22kV_150kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            total_kwh: 150
          }
        },
        expected: {
          energyCharge: 487.26,
          serviceCharge: 33.29,
          baseTariff: 520.55,
          ftCharge: 59.58,
          vat: 40.61,
          totalBill: 620.74
        }
      },
      '<22kV_400kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            total_kwh: 400
          }
        },
        expected: {
          energyCharge: 1542.71,
          serviceCharge: 33.29,
          baseTariff: 1576.00,
          ftCharge: 158.88,
          vat: 121.44,
          totalBill: 1856.32
        }
      },
      '22-33kV_1000kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '22-33kV',
          ftRateSatang: 39.72,
          usage: {
            total_kwh: 1000
          }
        },
        expected: {
          energyCharge: 3908.6,
          serviceCharge: 312.24,
          baseTariff: 4220.84,
          ftCharge: 397.2,
          vat: 323.26,
          totalBill: 4941.30
        }
      },
      '>=69kV_1000kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          usage: {
            total_kwh: 1000
          }
        },
        expected: {
          energyCharge: 3908.6,
          serviceCharge: 312.24,
          baseTariff: 4220.84,
          ftCharge: 397.2,
          vat: 323.26,
          totalBill: 4941.30
        }
      }
    },
    TOU: {
      '<22kV_200on_300off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            on_peak_kwh: 200,
            off_peak_kwh: 300
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 198.60,
          vat: 152.78,
          totalBill: 2335.38
        }
      },
      '<22kV_500on_0off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            on_peak_kwh: 500,
            off_peak_kwh: 0
          }
        },
        expected: {
          energyCharge: 2899.1,
          serviceCharge: 33.29,
          baseTariff: 2932.39,
          ftCharge: 198.60,
          vat: 219.17,
          totalBill: 3350.16
        }
      },
      '<22kV_0on_500off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            on_peak_kwh: 0,
            off_peak_kwh: 500
          }
        },
        expected: {
          energyCharge: 1318.45,
          serviceCharge: 33.29,
          baseTariff: 1351.74,
          ftCharge: 198.60,
          vat: 108.52,
          totalBill: 1659.86
        }
      }
    }
  },
  TYPE_3: {
    NORMAL: {
      '<22kV_500kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            total_kwh: 500
          }
        },
        expected: {
          energyCharge: 1984.88,
          serviceCharge: 33.29,
          baseTariff: 2018.17,
          ftCharge: 198.60,
          vat: 155.17,
          totalBill: 2371.94
        }
      }
    },
    TOU: {
      '<22kV_200on_300off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            on_peak_kwh: 200,
            off_peak_kwh: 300
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 198.60,
          vat: 152.78,
          totalBill: 2335.38
        }
      }
    }
  },
  TYPE_4: {
    TOD: {
      '<22kV_peak_offpeak_night': {
        input: {
          tariffType: 'tod',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            peak_kwh: 100,
            off_peak_kwh: 200,
            night_kwh: 100
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 158.88,
          vat: 149.40,
          totalBill: 2292.28
        }
      }
    },
    TOU: {
      '<22kV_200on_300off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            on_peak_kwh: 200,
            off_peak_kwh: 300
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 198.60,
          vat: 152.78,
          totalBill: 2335.38
        }
      }
    }
  },
  TYPE_5: {
    NORMAL: {
      '<22kV_500kWh': {
        input: {
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            total_kwh: 500
          }
        },
        expected: {
          energyCharge: 1984.88,
          serviceCharge: 33.29,
          baseTariff: 2018.17,
          ftCharge: 198.60,
          vat: 155.17,
          totalBill: 2371.94
        }
      }
    },
    TOU: {
      '<22kV_200on_300off': {
        input: {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          usage: {
            on_peak_kwh: 200,
            off_peak_kwh: 300
          }
        },
        expected: {
          energyCharge: 1950.71,
          serviceCharge: 33.29,
          baseTariff: 1984.00,
          ftCharge: 198.60,
          vat: 152.78,
          totalBill: 2335.38
        }
      }
    }
  }
};

/**
 * Error Test Data Sets
 */
const ERROR_TEST_DATA = {
  MISSING_FIELDS: {
    MISSING_BODY: {
      input: null,
      expectedStatus: 400,
      expectedError: 'Request body is required'
    },
    MISSING_TARIFF_TYPE: {
      input: {
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: tariffType'
    },
    MISSING_VOLTAGE_LEVEL: {
      input: {
        tariffType: 'normal',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: voltageLevel'
    },
    MISSING_FT_RATE: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: ftRateSatang'
    },
    MISSING_USAGE: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: usage'
    },
    MISSING_TOTAL_KWH: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {}
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: total_kwh'
    }
  },
  INVALID_VALUES: {
    INVALID_TARIFF_TYPE: {
      input: {
        tariffType: 'invalid',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Invalid tariff type for Type 2. Must be "normal" or "tou", received: invalid'
    },
    INVALID_VOLTAGE_LEVEL: {
      input: {
        tariffType: 'normal',
        voltageLevel: 'invalid',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Invalid voltage level for Type 2 normal. Must be ">=69kV", "22-33kV", "<22kV", received: invalid'
    },
    NEGATIVE_FT_RATE: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: -10,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 200 // Currently accepts negative values
    },
    NEGATIVE_TOTAL_KWH: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: -100
        }
      },
      expectedStatus: 200 // Currently accepts negative values
    }
  },
  INVALID_DATA_TYPES: {
    STRING_FT_RATE: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: 'invalid',
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400
    },
    STRING_TOTAL_KWH: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 'invalid'
        }
      },
      expectedStatus: 400
    },
    STRING_ON_PEAK_KWH: {
      input: {
        tariffType: 'tou',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {
          on_peak_kwh: 'invalid',
          off_peak_kwh: 300
        }
      },
      expectedStatus: 400
    },
    STRING_OFF_PEAK_KWH: {
      input: {
        tariffType: 'tou',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {
          on_peak_kwh: 200,
          off_peak_kwh: 'invalid'
        }
      },
      expectedStatus: 400
    }
  },
  EMPTY_VALUES: {
    EMPTY_TARIFF_TYPE: {
      input: {
        tariffType: '',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: tariffType'
    },
    EMPTY_VOLTAGE_LEVEL: {
      input: {
        tariffType: 'normal',
        voltageLevel: '',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: voltageLevel'
    },
    EMPTY_FT_RATE: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: '',
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: ftRateSatang'
    },
    EMPTY_USAGE: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {}
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: total_kwh'
    }
  },
  NULL_UNDEFINED: {
    NULL_TARIFF_TYPE: {
      input: {
        tariffType: null,
        voltageLevel: '<22kV',
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: tariffType'
    },
    UNDEFINED_VOLTAGE_LEVEL: {
      input: {
        tariffType: 'normal',
        voltageLevel: undefined,
        ftRateSatang: 39.72,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: voltageLevel'
    },
    NULL_FT_RATE: {
      input: {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: null,
        usage: {
          total_kwh: 500
        }
      },
      expectedStatus: 400,
      expectedError: 'Missing required field: ftRateSatang'
    }
  }
};

/**
 * Edge Case Test Data
 */
const EDGE_CASE_TEST_DATA = {
  MINIMAL_CONSUMPTION: {
    input: {
      tariffType: 'normal',
      voltageLevel: '<22kV',
      ftRateSatang: 39.72,
      usage: {
        total_kwh: 0.1
      }
    },
    expected: {
      energyCharge: 0.32,
      serviceCharge: 33.29,
      baseTariff: 33.61,
      ftCharge: 0.04,
      vat: 2.36,
      totalBill: 36.01
    }
  },
  VERY_HIGH_CONSUMPTION: {
    input: {
      tariffType: 'normal',
      voltageLevel: '<22kV',
      ftRateSatang: 39.72,
      usage: {
        total_kwh: 10000
      }
    },
    expected: {
      energyCharge: 44217.0,
      serviceCharge: 33.29,
      baseTariff: 44250.29,
      ftCharge: 3972.0,
      vat: 3375.56,
      totalBill: 51597.85
    }
  },
  ZERO_FT_RATE: {
    input: {
      tariffType: 'normal',
      voltageLevel: '<22kV',
      ftRateSatang: 0,
      usage: {
        total_kwh: 500
      }
    },
    expected: {
      energyCharge: 1984.88,
      serviceCharge: 33.29,
      baseTariff: 2018.17,
      ftCharge: 0,
      vat: 141.27,
      totalBill: 2159.44
    }
  },
  VERY_HIGH_FT_RATE: {
    input: {
      tariffType: 'normal',
      voltageLevel: '<22kV',
      ftRateSatang: 100.0,
      usage: {
        total_kwh: 500
      }
    },
    expected: {
      energyCharge: 1984.88,
      serviceCharge: 33.29,
      baseTariff: 2018.17,
      ftCharge: 500.0,
      vat: 176.27,
      totalBill: 2694.44
    }
  }
};

/**
 * Helper function to get test data by provider and type
 * @param {string} provider - 'mea' or 'pea'
 * @param {string} calculationType - 'type-2', 'type-3', etc.
 * @param {string} tariffType - 'normal', 'tou', 'tod'
 * @returns {Object} test data object
 */
const getTestData = (provider, calculationType, tariffType = null) => {
  const providerData = provider.toUpperCase() === 'MEA' ? MEA_TEST_DATA : PEA_TEST_DATA;
  const typeData = providerData[calculationType.toUpperCase().replace('-', '_')];
  
  if (tariffType) {
    return typeData[tariffType.toUpperCase()];
  }
  
  return typeData;
};

/**
 * Helper function to get error test data
 * @param {string} category - error category
 * @returns {Object} error test data
 */
const getErrorTestData = (category) => {
  return ERROR_TEST_DATA[category.toUpperCase()];
};

/**
 * Helper function to get edge case test data
 * @returns {Object} edge case test data
 */
const getEdgeCaseTestData = () => {
  return EDGE_CASE_TEST_DATA;
};

module.exports = {
  MEA_TEST_DATA,
  PEA_TEST_DATA,
  ERROR_TEST_DATA,
  EDGE_CASE_TEST_DATA,
  getTestData,
  getErrorTestData,
  getEdgeCaseTestData
};
