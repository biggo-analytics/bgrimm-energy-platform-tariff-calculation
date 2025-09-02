/**
 * Strategy Pattern Tests (API v2 only)
 * Tests for the refactored strategy pattern with centralized configuration
 */

const { getStrategy, getAvailableStrategies, isValidStrategy } = require('../src/strategy-selector');

describe('Strategy Pattern Tests (API v2)', () => {
  
  describe('Strategy Selector', () => {
    test('should load MEA strategy correctly', () => {
      const strategy = getStrategy('MEA_3.1.3_medium_normal');
      expect(strategy).toBeDefined();
      expect(typeof strategy.calculate).toBe('function');
    });

    test('should load PEA strategy correctly', () => {
      const strategy = getStrategy('PEA_4.1.2_large_TOD');
      expect(strategy).toBeDefined();
      expect(typeof strategy.calculate).toBe('function');
    });

    test('should throw error for invalid strategy name', () => {
      expect(() => {
        getStrategy('INVALID_STRATEGY');
      }).toThrow();
    });

    test('should validate strategy names correctly', () => {
      expect(isValidStrategy('MEA_3.1.3_medium_normal')).toBe(true);
      expect(isValidStrategy('PEA_4.1.2_large_TOD')).toBe(true);
      expect(isValidStrategy('INVALID_STRATEGY')).toBe(false);
    });

    test('should return available strategies', () => {
      const available = getAvailableStrategies();
      expect(available).toHaveProperty('mea');
      expect(available).toHaveProperty('pea');
      expect(available).toHaveProperty('all');
      expect(available.mea.length).toBeGreaterThan(0);
      expect(available.pea.length).toBeGreaterThan(0);
      expect(available.all.length).toBe(available.mea.length + available.pea.length);
    });
  });

  describe('MEA Strategy Calculations', () => {
    test('MEA Type 2 TOU (<12kV) calculation', () => {
      const strategy = getStrategy('MEA_2.2.1_small_TOU');
      const result = strategy.calculate({ onPeakKwh: 300, offPeakKwh: 700 });
      
      // Expected: 33.29 + (300 * 5.7982) + (700 * 2.6369) = 33.29 + 1739.46 + 1845.83 = 3618.58
      expect(result).toBeCloseTo(3618.58, 2);
    });

    test('MEA Type 3 Normal (<12kV) calculation', () => {
      const strategy = getStrategy('MEA_3.1.3_medium_normal');
      const result = strategy.calculate({ kwh: 1500, demand: 75 });
      
      // Expected: 312.24 + (75 * 221.50) + (1500 * 3.1751) = 312.24 + 16612.5 + 4762.65 = 21687.39
      expect(result).toBeCloseTo(21687.39, 2);
    });

    test('MEA Type 3 TOU (>=69kV) calculation', () => {
      const strategy = getStrategy('MEA_3.2.1_medium_TOU');
      const result = strategy.calculate({ onPeakKwh: 800, offPeakKwh: 1200, demand: 100 });
      
      // Expected: 312.24 + (100 * 74.14) + (800 * 4.1025) + (1200 * 2.5849) = 312.24 + 7414 + 3282 + 3101.88 = 14110.12
      expect(result).toBeCloseTo(14110.12, 2);
    });

    test('MEA Type 4 TOD (<12kV) calculation', () => {
      const strategy = getStrategy('MEA_4.1.3_large_TOD');
      const result = strategy.calculate({ 
        kwh: 2000, 
        onPeakDemand: 120, 
        partialPeakDemand: 80, 
        offPeakDemand: 40 
      });
      
      // Expected: 312.24 + (120 * 352.71) + (80 * 210.80) + (40 * 0) + (2000 * 3.1751)
      // = 312.24 + 42325.2 + 16864 + 0 + 6350.2 = 65851.64
      expect(result).toBeCloseTo(65851.64, 2);
    });

    test('MEA Type 5 Normal (12-24kV) calculation', () => {
      const strategy = getStrategy('MEA_5.1.2_specific_normal');
      const result = strategy.calculate({ kwh: 1000, demand: 50 });
      
      // Expected: 312.24 + (50 * 256.07) + (1000 * 3.1271) = 312.24 + 12803.5 + 3127.1 = 16242.84
      expect(result).toBeCloseTo(16242.84, 2);
    });
  });

  describe('PEA Strategy Calculations', () => {
    test('PEA Type 2 TOU (<22kV) calculation', () => {
      const strategy = getStrategy('PEA_2.2.1_small_TOU');
      const result = strategy.calculate({ onPeakKwh: 300, offPeakKwh: 700 });
      
      // Expected: 33.29 + (300 * 5.7982) + (700 * 2.6369) = 33.29 + 1739.46 + 1845.83 = 3618.58
      expect(result).toBeCloseTo(3618.58, 2);
    });

    test('PEA Type 3 Normal (>=69kV) calculation', () => {
      const strategy = getStrategy('PEA_3.1.1_medium_normal');
      const result = strategy.calculate({ kwh: 1500, demand: 75 });
      
      // Expected: 312.24 + (75 * 175.70) + (1500 * 3.1097) = 312.24 + 13177.5 + 4664.55 = 18154.29
      expect(result).toBeCloseTo(18154.29, 2);
    });

    test('PEA Type 4 TOD (22-33kV) calculation', () => {
      const strategy = getStrategy('PEA_4.1.2_large_TOD');
      const result = strategy.calculate({ 
        kwh: 2000, 
        onPeakDemand: 120, 
        partialPeakDemand: 80, 
        offPeakDemand: 40 
      });
      
      // Expected: 312.24 + (120 * 285.05) + (80 * 58.88) + (40 * 0) + (2000 * 3.1471)
      // = 312.24 + 34206 + 4710.4 + 0 + 6294.2 = 45522.84
      expect(result).toBeCloseTo(45522.84, 2);
    });
  });
});
