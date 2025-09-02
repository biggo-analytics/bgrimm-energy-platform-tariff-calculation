/**
 * MEA Rate Configuration
 * Contains MEA electricity tariff rates for different customer types and voltage levels
 */

const MEA_RATES = {
  TYPE_2: {
    normal: {
      '<12kV': {
        tier1: { threshold: 0, rate: 3.2484 },
        tier2: { threshold: 150, rate: 4.2218 },
        tier3: { threshold: 400, rate: 4.4217 }
      },
      '12-24kV': {
        tier1: { threshold: 0, rate: 3.9086 },
        tier2: { threshold: 150, rate: 4.8819 },
        tier3: { threshold: 400, rate: 5.0818 }
      },
      '>=69kV': {
        tier1: { threshold: 0, rate: 3.8086 },
        tier2: { threshold: 150, rate: 4.7819 },
        tier3: { threshold: 400, rate: 4.9818 }
      }
    },
    tou: {
      '<12kV': {
        onPeakRate: 5.7982,
        offPeakRate: 2.6369
      },
      '12-24kV': {
        onPeakRate: 5.4586,
        offPeakRate: 2.6037
      },
      '>=69kV': {
        onPeakRate: 5.3586,
        offPeakRate: 2.5037
      }
    }
  }
};

const MEA_SERVICE_CHARGE = {
  TYPE_2: {
    '<12kV': 33.29,
    '12-24kV': 312.24,
    '>=69kV': 312.24
  }
};

module.exports = {
  MEA_RATES,
  MEA_SERVICE_CHARGE
};
