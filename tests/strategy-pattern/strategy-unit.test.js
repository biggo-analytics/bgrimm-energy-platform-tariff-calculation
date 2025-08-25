/**
 * Strategy Pattern Unit Tests
 * Unit tests for individual strategy classes and factory
 */

const TariffStrategyFactory = require('../../src/services/factories/tariff-strategy-factory');
const NormalTariffStrategy = require('../../src/services/strategies/normal-tariff-strategy');
const TOUTariffStrategy = require('../../src/services/strategies/tou-tariff-strategy');
const TODTariffStrategy = require('../../src/services/strategies/tod-tariff-strategy');
const { MEA_RATES, MEA_SERVICE_CHARGE } = require('../../src/config/mea-rates');
const { PEA_RATES } = require('../../src/config/pea-rates');

describe('Strategy Pattern Unit Tests', () => {
  
  describe('TariffStrategyFactory', () => {
    test('should create Normal strategy', () => {
      const strategy = TariffStrategyFactory.createStrategy('normal', MEA_RATES, MEA_SERVICE_CHARGE);
      expect(strategy).toBeInstanceOf(NormalTariffStrategy);
      expect(strategy.getTariffType()).toBe('normal');
    });

    test('should create TOU strategy', () => {
      const strategy = TariffStrategyFactory.createStrategy('tou', MEA_RATES, MEA_SERVICE_CHARGE);
      expect(strategy).toBeInstanceOf(TOUTariffStrategy);
      expect(strategy.getTariffType()).toBe('tou');
    });

    test('should create TOD strategy', () => {
      const strategy = TariffStrategyFactory.createStrategy('tod', MEA_RATES, MEA_SERVICE_CHARGE);
      expect(strategy).toBeInstanceOf(TODTariffStrategy);
      expect(strategy.getTariffType()).toBe('tod');
    });

    test('should throw error for invalid tariff type', () => {
      expect(() => {
        TariffStrategyFactory.createStrategy('invalid', MEA_RATES, MEA_SERVICE_CHARGE);
      }).toThrow('Unsupported tariff type: invalid');
    });

    test('should throw error for missing rates', () => {
      expect(() => {
        TariffStrategyFactory.createStrategy('normal', null, MEA_SERVICE_CHARGE);
      }).toThrow('Rates configuration is required');
    });

    test('should return correct supported tariff types', () => {
      const supportedTypes = TariffStrategyFactory.getSupportedTariffTypes();
      expect(supportedTypes).toEqual(['normal', 'tou', 'tod']);
    });

    test('should return correct tariff types for calculation types', () => {
      expect(TariffStrategyFactory.getSupportedTariffTypesForCalculationType('type-2'))
        .toEqual(['normal', 'tou']);
      expect(TariffStrategyFactory.getSupportedTariffTypesForCalculationType('type-4'))
        .toEqual(['tod', 'tou']);
    });

    test('should validate tariff type for calculation type', () => {
      expect(TariffStrategyFactory.isValidTariffTypeForCalculationType('normal', 'type-2')).toBe(true);
      expect(TariffStrategyFactory.isValidTariffTypeForCalculationType('tod', 'type-2')).toBe(false);
      expect(TariffStrategyFactory.isValidTariffTypeForCalculationType('tod', 'type-4')).toBe(true);
    });

    test('should create validated strategy successfully', () => {
      const strategy = TariffStrategyFactory.createValidatedStrategy('normal', 'type-2', MEA_RATES, MEA_SERVICE_CHARGE);
      expect(strategy).toBeInstanceOf(NormalTariffStrategy);
    });

    test('should throw error for invalid validated strategy', () => {
      expect(() => {
        TariffStrategyFactory.createValidatedStrategy('tod', 'type-2', MEA_RATES, MEA_SERVICE_CHARGE);
      }).toThrow("Tariff type 'tod' is not supported for type-2");
    });
  });

  describe('NormalTariffStrategy', () => {
    let strategy;

    beforeEach(() => {
      strategy = new NormalTariffStrategy(MEA_RATES, MEA_SERVICE_CHARGE);
    });

    test('should return correct tariff type', () => {
      expect(strategy.getTariffType()).toBe('normal');
    });

    test('should validate input correctly', () => {
      const validData = {
        tariffType: 'normal',
        voltageLevel: '<12kV'
      };
      expect(() => strategy.validateInput('type-2', validData)).not.toThrow();
    });

    test('should throw error for mismatched tariff type', () => {
      const invalidData = {
        tariffType: 'tou',
        voltageLevel: '<12kV'
      };
      expect(() => strategy.validateInput('type-2', invalidData))
        .toThrow('Tariff type mismatch. Expected normal, got tou');
    });

    test('should calculate Type 2 normal correctly', () => {
      const data = {
        tariffType: 'normal',
        voltageLevel: '<12kV',
        ftRateSatang: 19.72,
        usage: {
          total_kwh: 500
        }
      };

      const result = strategy.calculate('type-2', data);
      expect(result).toMatchObject({
        energyCharge: expect.any(Number),
        serviceCharge: 33.29,
        baseTariff: expect.any(Number),
        ftCharge: expect.any(Number),
        vat: expect.any(Number),
        totalBill: expect.any(Number)
      });
    });

    test('should throw error for Type 4 normal (not supported)', () => {
      const data = {
        tariffType: 'normal',
        voltageLevel: '>=69kV',
        ftRateSatang: 19.72,
        usage: { peak_kw: 100 }
      };

      expect(() => strategy.calculate('type-4', data))
        .toThrow('Type 4 does not support normal tariff');
    });

    test('should get rates correctly', () => {
      const rates = strategy.getRates('type-2', '<12kV');
      expect(rates).toMatchObject({
        serviceCharge: 33.29,
        energyRates: expect.any(Array)
      });
    });
  });

  describe('TOUTariffStrategy', () => {
    let strategy;

    beforeEach(() => {
      strategy = new TOUTariffStrategy(MEA_RATES, MEA_SERVICE_CHARGE);
    });

    test('should return correct tariff type', () => {
      expect(strategy.getTariffType()).toBe('tou');
    });

    test('should calculate Type 2 TOU correctly', () => {
      const data = {
        tariffType: 'tou',
        voltageLevel: '<12kV',
        ftRateSatang: 19.72,
        usage: {
          on_peak_kwh: 300,
          off_peak_kwh: 200
        }
      };

      const result = strategy.calculate('type-2', data);
      expect(result).toMatchObject({
        energyCharge: expect.any(Number),
        serviceCharge: 33.29,
        totalBill: expect.any(Number)
      });

      // Verify TOU calculation
      const expectedEnergyCharge = (300 * 5.7982) + (200 * 2.6369);
      expect(result.energyCharge).toBeCloseTo(expectedEnergyCharge, 3);
    });

    test('should calculate Type 3 TOU correctly', () => {
      const data = {
        tariffType: 'tou',
        voltageLevel: '>=69kV',
        ftRateSatang: 19.72,
        peakKvar: 100,
        highestDemandChargeLast12m: 1000,
        usage: {
          on_peak_kwh: 800,
          off_peak_kwh: 1200,
          on_peak_kw: 150,
          off_peak_kw: 120
        }
      };

      const result = strategy.calculate('type-3', data);
      expect(result).toMatchObject({
        calculatedDemandCharge: expect.any(Number),
        energyCharge: expect.any(Number),
        grandTotal: expect.any(Number)
      });
    });
  });

  describe('TODTariffStrategy', () => {
    let strategy;

    beforeEach(() => {
      strategy = new TODTariffStrategy(MEA_RATES, MEA_SERVICE_CHARGE);
    });

    test('should return correct tariff type', () => {
      expect(strategy.getTariffType()).toBe('tod');
    });

    test('should calculate Type 4 TOD correctly', () => {
      const data = {
        tariffType: 'tod',
        voltageLevel: '>=69kV',
        ftRateSatang: 19.72,
        peakKvar: 200,
        highestDemandChargeLast12m: 2000,
        usage: {
          total_kwh: 5000,
          on_peak_kw: 300,
          partial_peak_kw: 250,
          off_peak_kw: 200
        }
      };

      const result = strategy.calculate('type-4', data);
      expect(result).toMatchObject({
        calculatedDemandCharge: expect.any(Number),
        energyCharge: expect.any(Number),
        grandTotal: expect.any(Number)
      });

      // Verify TOD demand charge calculation
      const expectedDemandCharge = (300 * 280.00) + (250 * 74.14) + (200 * 0);
      expect(result.calculatedDemandCharge).toBeCloseTo(expectedDemandCharge, 1);
    });

    test('should throw error for non-Type-4 calculations', () => {
      const data = {
        tariffType: 'tod',
        voltageLevel: '<12kV',
        ftRateSatang: 19.72,
        usage: { total_kwh: 500 }
      };

      expect(() => strategy.calculate('type-2', data))
        .toThrow('type-2 does not support TOD tariff');
    });

    test('should calculate usage totals with partial peak', () => {
      const usage = {
        on_peak_kw: 300,
        partial_peak_kw: 250,
        off_peak_kw: 200,
        total_kwh: 5000
      };

      const totals = strategy.calculateUsageTotals(usage, 'type-4');
      expect(totals.overallPeakKw).toBe(300); // Max of all three peaks
      expect(totals.totalKwhForFt).toBe(5000);
    });
  });

  describe('Strategy Pattern with PEA Rates', () => {
    test('should work with PEA rates', () => {
      const strategy = new NormalTariffStrategy(PEA_RATES, null);
      
      const data = {
        tariffType: 'normal',
        voltageLevel: '<22kV',
        ftRateSatang: 19.72,
        usage: {
          total_kwh: 500
        }
      };

      const result = strategy.calculate('type-2', data);
      expect(result).toMatchObject({
        energyCharge: expect.any(Number),
        serviceCharge: 33.29,
        totalBill: expect.any(Number)
      });
    });

    test('should handle PEA voltage levels correctly', () => {
      const strategy = new NormalTariffStrategy(PEA_RATES, null);
      
      expect(() => {
        strategy.getRates('type-2', '<22kV');
      }).not.toThrow();

      expect(() => {
        strategy.getRates('type-2', '<12kV'); // MEA voltage level
      }).toThrow();
    });
  });
});
