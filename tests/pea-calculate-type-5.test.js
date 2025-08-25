const request = require('supertest');
const app = require('../src/app');

describe('PEA Type 5 - Specific Business Service API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Normal Tariff', () => {
    const baseUrl = '/api/pea/calculate/type-5';

    test('should calculate bill for Normal tariff at <22kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('calculatedDemandCharge');
      expect(response.body).toHaveProperty('energyCharge');
      expect(response.body).toHaveProperty('effectiveDemandCharge');
      expect(response.body).toHaveProperty('pfCharge');
      expect(response.body).toHaveProperty('serviceCharge');
      expect(response.body).toHaveProperty('ftCharge');
      expect(response.body).toHaveProperty('subTotal');
      expect(response.body).toHaveProperty('vat');
      expect(response.body).toHaveProperty('grandTotal');

      // Verify calculations based on PEA_TYPE_5_RATES
      // Demand charge: 100 * 276.64 = 27664.00
      expect(response.body.calculatedDemandCharge).toBeCloseTo(27664.00, 1);
      // Energy charge: 50000 * 3.1751 = 158755.00
      expect(response.body.energyCharge).toBeCloseTo(158755.00, 1);
      // Service charge: 312.24
      expect(response.body.serviceCharge).toBe(312.24);
      // FT charge: 50000 * 39.72 / 100 = 19860.00
      expect(response.body.ftCharge).toBeCloseTo(19860.00, 1);
      // Power factor penalty: (120 - 100*0.6197) * 56.07 = (120 - 61.97) * 56.07 = 3252.06
      expect(response.body.pfCharge).toBeCloseTo(3252.06, 2);
    });

    test('should calculate bill for Normal tariff at 22-33kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '22-33kV',
          ftRateSatang: 39.72,
          peakKvar: 100,
          highestDemandChargeLast12m: 25000.00,
          usage: {
            peak_kw: 80,
            total_kwh: 40000
          }
        });

      expect(response.status).toBe(200);
      // Demand charge: 80 * 256.07 = 20485.60
      expect(response.body.calculatedDemandCharge).toBeCloseTo(20485.60, 1);
      // Energy charge: 40000 * 3.1471 = 125884.00
      expect(response.body.energyCharge).toBeCloseTo(125884.00, 1);
      // Service charge: 312.24
      expect(response.body.serviceCharge).toBe(312.24);
      // FT charge: 40000 * 39.72 / 100 = 15888.00
      expect(response.body.ftCharge).toBeCloseTo(15888.00, 1);
    });

    test('should calculate bill for Normal tariff at >=69kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 90,
          highestDemandChargeLast12m: 20000.00,
          usage: {
            peak_kw: 70,
            total_kwh: 35000
          }
        });

      expect(response.status).toBe(200);
      // Demand charge: 70 * 220.56 = 15439.20
      expect(response.body.calculatedDemandCharge).toBeCloseTo(15439.20, 1);
      // Energy charge: 35000 * 3.1097 = 108839.50
      expect(response.body.energyCharge).toBeCloseTo(108839.50, 1);
      // Service charge: 312.24
      expect(response.body.serviceCharge).toBe(312.24);
      // FT charge: 35000 * 39.72 / 100 = 13902.00
      expect(response.body.ftCharge).toBeCloseTo(13902.00, 1);
    });
  });

  describe('TOU Tariff', () => {
    const baseUrl = '/api/pea/calculate/type-5';

    test('should calculate bill for TOU tariff at 22-33kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          ftRateSatang: 39.72,
          peakKvar: 110,
          highestDemandChargeLast12m: 28000.00,
          usage: {
            on_peak_kw: 120,
            on_peak_kwh: 20000,
            off_peak_kw: 90,
            off_peak_kwh: 35000
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('calculatedDemandCharge');
      expect(response.body).toHaveProperty('energyCharge');
      expect(response.body).toHaveProperty('effectiveDemandCharge');
      expect(response.body).toHaveProperty('pfCharge');
      expect(response.body).toHaveProperty('serviceCharge');
      expect(response.body).toHaveProperty('ftCharge');
      expect(response.body).toHaveProperty('subTotal');
      expect(response.body).toHaveProperty('vat');
      expect(response.body).toHaveProperty('grandTotal');

      // Verify calculations based on PEA_TYPE_5_RATES
      // Demand charge: 120 * 132.93 = 15951.60
      expect(response.body.calculatedDemandCharge).toBeCloseTo(15951.60, 1);
      // Energy charge: (20000 * 4.1839) + (35000 * 2.6037) = 83678 + 91129.5 = 174807.5
      expect(response.body.energyCharge).toBeCloseTo(174807.5, 1);
      // Service charge: 312.24
      expect(response.body.serviceCharge).toBe(312.24);
      // FT charge: (20000 + 35000) * 39.72 / 100 = 55000 * 0.3972 = 21846.00
      expect(response.body.ftCharge).toBeCloseTo(21846.00, 1);
      // Power factor penalty: (110 - 120*0.6197) * 56.07 = (110 - 74.364) * 56.07 = 2018.52
      expect(response.body.pfCharge).toBeCloseTo(2018.52, 2);
    });

    test('should calculate bill for TOU tariff at >=69kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 85,
          highestDemandChargeLast12m: 22000.00,
          usage: {
            on_peak_kw: 100,
            on_peak_kwh: 15000,
            off_peak_kw: 80,
            off_peak_kwh: 30000
          }
        });

      expect(response.status).toBe(200);
      // Demand charge: 100 * 74.14 = 7414.00
      expect(response.body.calculatedDemandCharge).toBeCloseTo(7414.00, 1);
      // Energy charge: (15000 * 4.1025) + (30000 * 2.5849) = 61537.5 + 77547 = 139084.5
      expect(response.body.energyCharge).toBeCloseTo(139084.5, 1);
      // Service charge: 312.24
      expect(response.body.serviceCharge).toBe(312.24);
      // FT charge: (15000 + 30000) * 39.72 / 100 = 45000 * 0.3972 = 17874.00
      expect(response.body.ftCharge).toBeCloseTo(17874.00, 1);
    });

    test('should calculate bill for TOU tariff at <22kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 95,
          highestDemandChargeLast12m: 18000.00,
          usage: {
            on_peak_kw: 110,
            on_peak_kwh: 18000,
            off_peak_kw: 85,
            off_peak_kwh: 32000
          }
        });

      expect(response.status).toBe(200);
      // Demand charge: 110 * 210.00 = 23100.00
      expect(response.body.calculatedDemandCharge).toBeCloseTo(23100.00, 1);
      // Energy charge: (18000 * 4.3297) + (32000 * 2.6369) = 77934.6 + 84380.8 = 162315.4
      expect(response.body.energyCharge).toBeCloseTo(162315.4, 1);
      // Service charge: 312.24
      expect(response.body.serviceCharge).toBe(312.24);
      // FT charge: (18000 + 32000) * 39.72 / 100 = 50000 * 0.3972 = 19860.00
      expect(response.body.ftCharge).toBeCloseTo(19860.00, 1);
    });
  });

  describe('Minimum Bill Protection', () => {
    const baseUrl = '/api/pea/calculate/type-5';

    test('should apply minimum bill when calculated demand is lower', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 50,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 50, // Low demand
            total_kwh: 20000
          }
        });

      expect(response.status).toBe(200);
      const calculatedDemand = 50 * 220.56; // 11028
      const minimumDemand = 30000 * 0.70; // 21000
      expect(response.body.calculatedDemandCharge).toBeCloseTo(calculatedDemand, 1);
      expect(response.body.effectiveDemandCharge).toBeCloseTo(minimumDemand, 1);
    });

    test('should not apply minimum bill when calculated demand is higher', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          ftRateSatang: 39.72,
          peakKvar: 150,
          highestDemandChargeLast12m: 15000.00,
          usage: {
            on_peak_kw: 200, // High demand
            on_peak_kwh: 25000,
            off_peak_kw: 180,
            off_peak_kwh: 40000
          }
        });

      expect(response.status).toBe(200);
      const calculatedDemand = 200 * 132.93; // 26586
      const minimumDemand = 15000 * 0.70; // 10500
      expect(response.body.calculatedDemandCharge).toBeCloseTo(calculatedDemand, 1);
      expect(response.body.effectiveDemandCharge).toBeCloseTo(calculatedDemand, 1);
      expect(response.body.effectiveDemandCharge).toBeGreaterThan(minimumDemand);
    });
  });

  describe('Power Factor Calculations', () => {
    const baseUrl = '/api/pea/calculate/type-5';

    test('should calculate power factor penalty correctly', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 150, // High reactive power
          highestDemandChargeLast12m: 25000.00,
          usage: {
            peak_kw: 100, // Low active power
            total_kwh: 45000
          }
        });

      expect(response.status).toBe(200);
      // Power factor penalty: (150 - 100*0.6197) * 56.07 = (150 - 61.97) * 56.07 = 88.03 * 56.07 = 4934.16
      expect(response.body.pfCharge).toBeCloseTo(4934.16, 2);
    });

    test('should have zero power factor penalty when within limits', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 60, // Low reactive power
          highestDemandChargeLast12m: 20000.00,
          usage: {
            on_peak_kw: 120, // High active power
            on_peak_kwh: 20000,
            off_peak_kw: 100,
            off_peak_kwh: 30000
          }
        });

      expect(response.status).toBe(200);
      // Power factor penalty: max(0, 60 - 120*0.6197) * 56.07 = max(0, 60 - 74.364) * 56.07 = 0
      expect(response.body.pfCharge).toBeCloseTo(0);
    });
  });

  describe('Validation Errors', () => {
    const baseUrl = '/api/pea/calculate/type-5';

    test('should return 400 for missing tariffType', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: tariffType');
    });

    test('should return 400 for missing voltageLevel', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel');
    });

    test('should return 400 for missing ftRateSatang', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '<22kV',
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang');
    });

    test('should return 400 for missing peakKvar', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar');
    });

    test('should return 400 for missing highestDemandChargeLast12m', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 120,
          usage: {
            peak_kw: 100,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m');
    });

    test('should return 400 for missing usage', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: usage');
    });

    test('should return 400 for invalid tariff type', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'invalid',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid tariff type for Type 5. Must be "normal" or "tou", received: invalid');
    });

    test('should return 400 for invalid voltage level', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: 'invalid',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid voltage level for Type 5 normal. Must be ">=69kV", "22-33kV", or "<22kV", received: invalid');
    });
  });

  describe('Edge Cases', () => {
    const baseUrl = '/api/pea/calculate/type-5';

    test('should handle zero usage gracefully', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 50,
          highestDemandChargeLast12m: 10000.00,
          usage: {
            peak_kw: 0,
            total_kwh: 0
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.calculatedDemandCharge).toBeCloseTo(0);
      expect(response.body.energyCharge).toBeCloseTo(0);
      expect(response.body.ftCharge).toBeCloseTo(0);
      expect(response.body.serviceCharge).toBe(312.24);
    });

    test('should handle very high usage values', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 500,
          highestDemandChargeLast12m: 100000.00,
          usage: {
            on_peak_kw: 1000,
            on_peak_kwh: 50000,
            off_peak_kw: 800,
            off_peak_kwh: 100000
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.calculatedDemandCharge).toBeCloseTo(74140, 1); // 1000 * 74.14
      expect(response.body.energyCharge).toBeCloseTo(463615, 1); // (50000 * 4.1025) + (100000 * 2.5849)
      expect(response.body.ftCharge).toBeCloseTo(59580, 1); // 150000 * 39.72 / 100
    });

    test('should handle TOU with zero off-peak usage', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          ftRateSatang: 39.72,
          peakKvar: 80,
          highestDemandChargeLast12m: 15000.00,
          usage: {
            on_peak_kw: 120,
            on_peak_kwh: 20000,
            off_peak_kw: 0,
            off_peak_kwh: 0
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.calculatedDemandCharge).toBeCloseTo(15951.6, 1); // 120 * 132.93
      expect(response.body.energyCharge).toBeCloseTo(83678, 1); // 20000 * 4.1839
      expect(response.body.ftCharge).toBeCloseTo(7944, 1); // 20000 * 39.72 / 100
    });
  });

  describe('Bill Component Calculations', () => {
    const baseUrl = '/api/pea/calculate/type-5';

    test('should correctly calculate all bill components for normal tariff', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '<22kV',
          ftRateSatang: 39.72,
          peakKvar: 100,
          highestDemandChargeLast12m: 25000.00,
          usage: {
            peak_kw: 90,
            total_kwh: 40000
          }
        });

      expect(response.status).toBe(200);
      
      // Verify all components are present and calculated correctly
      expect(response.body).toHaveProperty('calculatedDemandCharge');
      expect(response.body).toHaveProperty('energyCharge');
      expect(response.body).toHaveProperty('effectiveDemandCharge');
      expect(response.body).toHaveProperty('pfCharge');
      expect(response.body).toHaveProperty('serviceCharge');
      expect(response.body).toHaveProperty('ftCharge');
      expect(response.body).toHaveProperty('subTotal');
      expect(response.body).toHaveProperty('vat');
      expect(response.body).toHaveProperty('grandTotal');

      // Verify calculations
      const expectedDemandCharge = 90 * 276.64; // 24897.6
      const expectedEnergyCharge = 40000 * 3.1751; // 127004
      const expectedFtCharge = 40000 * (39.72 / 100); // 15888
      const expectedServiceCharge = 312.24;

      expect(response.body.calculatedDemandCharge).toBeCloseTo(expectedDemandCharge, 1);
      expect(response.body.energyCharge).toBeCloseTo(expectedEnergyCharge, 1);
      expect(response.body.serviceCharge).toBe(expectedServiceCharge);
      expect(response.body.ftCharge).toBeCloseTo(expectedFtCharge, 1);
      expect(response.body.pfCharge).toBeCloseTo(2467.08, 2);

      // Verify subtotal and VAT calculations
      const expectedSubTotal = response.body.effectiveDemandCharge + expectedEnergyCharge + 2467.08 + expectedServiceCharge + expectedFtCharge;
      const expectedVat = expectedSubTotal * 0.07;
      const expectedGrandTotal = expectedSubTotal + expectedVat;

      expect(response.body.subTotal).toBeCloseTo(expectedSubTotal, 2);
      expect(response.body.vat).toBeCloseTo(expectedVat, 5);
      expect(response.body.grandTotal).toBeCloseTo(expectedGrandTotal, 5);
    });

    test('should correctly calculate all bill components for TOU tariff', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            on_peak_kw: 150,
            on_peak_kwh: 12000,
            off_peak_kw: 120,
            off_peak_kwh: 18000
          }
        });

      expect(response.status).toBe(200);
      
      // Verify all components are present and calculated correctly
      expect(response.body).toHaveProperty('calculatedDemandCharge');
      expect(response.body).toHaveProperty('energyCharge');
      expect(response.body).toHaveProperty('effectiveDemandCharge');
      expect(response.body).toHaveProperty('pfCharge');
      expect(response.body).toHaveProperty('serviceCharge');
      expect(response.body).toHaveProperty('ftCharge');
      expect(response.body).toHaveProperty('subTotal');
      expect(response.body).toHaveProperty('vat');
      expect(response.body).toHaveProperty('grandTotal');

      // Verify calculations
      const expectedDemandCharge = 150 * 132.93; // 19939.5
      const expectedEnergyCharge = (12000 * 4.1839) + (18000 * 2.6037); // 50206.8 + 46866.6 = 97073.4
      const expectedFtCharge = (12000 + 18000) * (39.72 / 100); // 30000 * 0.3972 = 11916
      const expectedServiceCharge = 312.24;

      expect(response.body.calculatedDemandCharge).toBeCloseTo(expectedDemandCharge, 1);
      expect(response.body.energyCharge).toBeCloseTo(expectedEnergyCharge, 1);
      expect(response.body.serviceCharge).toBe(expectedServiceCharge);
      expect(response.body.ftCharge).toBeCloseTo(expectedFtCharge, 1);
      expect(response.body.pfCharge).toBeCloseTo(1513.89, 2);

      // Verify subtotal and VAT calculations
      const expectedSubTotal = response.body.effectiveDemandCharge + expectedEnergyCharge + 1513.89 + expectedServiceCharge + expectedFtCharge;
      const expectedVat = expectedSubTotal * 0.07;
      const expectedGrandTotal = expectedSubTotal + expectedVat;

      expect(response.body.subTotal).toBeCloseTo(expectedSubTotal, 2);
      expect(response.body.vat).toBeCloseTo(expectedVat, 5);
      expect(response.body.grandTotal).toBeCloseTo(expectedGrandTotal, 5);
    });
  });
});
