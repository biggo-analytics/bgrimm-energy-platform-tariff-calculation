/**
 * PEA Type 4 - Large Business Service Tests
 * Comprehensive test suite for PEA Type 4 electricity bill calculations
 */

const request = require('supertest');
const app = require('../../src/app');

describe('PEA Type 4 - Large Business Service API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  const baseUrl = '/api/pea/calculate/type-4';

  describe('TOD Tariff Tests', () => {
    describe('Valid Input Tests', () => {
      test('should calculate bill for >=69kV TOD', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
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
        
        // Verify calculations: (250 * 224.30) + (200 * 29.91) + (100 * 0) = 56075 + 5982 = 62057
        expect(response.body.calculatedDemandCharge).toBeCloseTo(62057, 1);
        expect(response.body.energyCharge).toBeCloseTo(310970, 1); // 100000 * 3.1097
        expect(response.body.serviceCharge).toBe(312.24);
        expect(response.body.ftCharge).toBeCloseTo(39720, 1); // 100000 * 39.72 / 100
      });

      test('should calculate bill for 22-33kV TOD', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '22-33kV',
            ftRateSatang: 39.72,
            peakKvar: 180,
            highestDemandChargeLast12m: 50000.00,
            usage: {
              on_peak_kw: 200,
              partial_peak_kw: 150,
              off_peak_kw: 80,
              total_kwh: 80000
            }
          });

        expect(response.status).toBe(200);
        // Verify calculations: (200 * 285.05) + (150 * 58.88) + (80 * 0) = 57010 + 8832 = 65842
        expect(response.body.calculatedDemandCharge).toBeCloseTo(65842, 1);
        expect(response.body.energyCharge).toBeCloseTo(251768, 1); // 80000 * 3.1471
        expect(response.body.serviceCharge).toBe(312.24);
      });

      test('should calculate bill for <22kV TOD', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '<22kV',
            ftRateSatang: 39.72,
            peakKvar: 150,
            highestDemandChargeLast12m: 40000.00,
            usage: {
              on_peak_kw: 180,
              partial_peak_kw: 120,
              off_peak_kw: 90,
              total_kwh: 70000
            }
          });

        expect(response.status).toBe(200);
        // Verify calculations: (180 * 332.71) + (120 * 68.22) + (90 * 0) = 59887.8 + 8186.4 = 68074.2
        expect(response.body.calculatedDemandCharge).toBeCloseTo(68074.2, 1);
        expect(response.body.energyCharge).toBeCloseTo(222257, 1); // 70000 * 3.1751
        expect(response.body.serviceCharge).toBe(312.24);
      });

      test('should calculate bill with zero FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 0,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.ftCharge).toBeCloseTo(0, 2);
      });

      test('should calculate bill with very high FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 100.0,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.ftCharge).toBeCloseTo(100000.0, 2); // 100000 * 100 / 100
      });
    });

    describe('Edge Cases', () => {
      test('should handle minimum consumption (1 kW each, 1 kWh)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 10,
            highestDemandChargeLast12m: 1000.00,
            usage: {
              on_peak_kw: 1,
              partial_peak_kw: 1,
              off_peak_kw: 1,
              total_kwh: 1
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.calculatedDemandCharge).toBeCloseTo(254.21, 1); // (1 * 224.30) + (1 * 29.91) + (1 * 0)
        expect(response.body.energyCharge).toBeCloseTo(3.11, 1); // 1 * 3.1097
      });

      test('should handle very high consumption (1000 kW each, 1000000 kWh)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 2000,
            highestDemandChargeLast12m: 500000.00,
            usage: {
              on_peak_kw: 1000,
              partial_peak_kw: 1000,
              off_peak_kw: 1000,
              total_kwh: 1000000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.calculatedDemandCharge).toBeGreaterThan(250000); // Should be significant
        expect(response.body.energyCharge).toBeGreaterThan(3000000); // Should be significant
      });

      test('should handle decimal values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200.5,
            highestDemandChargeLast12m: 60000.50,
            usage: {
              on_peak_kw: 250.5,
              partial_peak_kw: 200.5,
              off_peak_kw: 100.5,
              total_kwh: 100000.5
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.calculatedDemandCharge).toBeCloseTo(62229.21, 1); // (250.5 * 224.30) + (200.5 * 29.91) + (100.5 * 0)
        expect(response.body.energyCharge).toBeCloseTo(311125.5, 1); // 100000.5 * 3.1097
      });
    });
  });

  describe('TOU Tariff Tests', () => {
    describe('Valid Input Tests', () => {
      test('should calculate bill for >=69kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 160,
            highestDemandChargeLast12m: 45000.00,
            usage: {
              on_peak_kw: 200,
              on_peak_kwh: 15000,
              off_peak_kw: 150,
              off_peak_kwh: 25000
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
      });

      test('should calculate bill for 22-33kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 39.72,
            peakKvar: 140,
            highestDemandChargeLast12m: 35000.00,
            usage: {
              on_peak_kw: 150,
              on_peak_kwh: 12000,
              off_peak_kw: 120,
              off_peak_kwh: 20000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.calculatedDemandCharge).toBeCloseTo(19939.5, 1); // 150 * 132.93
        expect(response.body.energyCharge).toBeCloseTo(167592, 1); // (12000 * 4.1839) + (20000 * 2.6037)
      });

      test('should calculate bill for <22kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 25000.00,
            usage: {
              on_peak_kw: 120,
              on_peak_kwh: 10000,
              off_peak_kw: 100,
              off_peak_kwh: 15000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.calculatedDemandCharge).toBeCloseTo(25296, 1); // 120 * 210.80
        expect(response.body.energyCharge).toBeCloseTo(108625, 1); // (10000 * 4.3297) + (15000 * 2.6369)
      });

      test('should handle zero off-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 160,
            highestDemandChargeLast12m: 45000.00,
            usage: {
              on_peak_kw: 200,
              on_peak_kwh: 15000,
              off_peak_kw: 0,
              off_peak_kwh: 0
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(61537.5, 1); // 15000 * 4.1025
      });

      test('should handle zero on-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 160,
            highestDemandChargeLast12m: 45000.00,
            usage: {
              on_peak_kw: 0,
              on_peak_kwh: 0,
              off_peak_kw: 150,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(64622.5, 1); // 25000 * 2.5849
      });
    });

    describe('Edge Cases', () => {
      test('should handle very small consumption values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 10,
            highestDemandChargeLast12m: 1000.00,
            usage: {
              on_peak_kw: 0.1,
              on_peak_kwh: 0.1,
              off_peak_kw: 0.1,
              off_peak_kwh: 0.1
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(0.67, 2); // (0.1 * 4.1025) + (0.1 * 2.5849)
      });

      test('should handle very large consumption values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 1000,
            highestDemandChargeLast12m: 300000.00,
            usage: {
              on_peak_kw: 500,
              on_peak_kwh: 500000,
              off_peak_kw: 400,
              off_peak_kwh: 500000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeGreaterThan(3000000);
      });
    });
  });

  describe('Validation Error Tests', () => {
    describe('Missing Required Fields', () => {
      test('should return 400 for missing request body', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send();

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Request body is required');
      });

      test('should return 400 for missing tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType');
      });

      test('should return 400 for missing voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel');
      });

      test('should return 400 for missing ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang');
      });

      test('should return 400 for missing peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar');
      });

      test('should return 400 for missing highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: usage');
      });
    });

    describe('Invalid Field Values', () => {
      test('should return 400 for invalid tariff type', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'invalid',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid tariff type for Type 4. Must be "tod" or "tou", received: invalid');
      });

      test('should return 400 for invalid voltage level', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: 'invalid',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid voltage level for Type 4 tod. Must be ">=69kV", "22-33kV", or "<22kV", received: invalid');
      });

      test('should return 400 for negative ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: -10,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      test('should return 400 for negative peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: -10,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      test('should return 400 for negative highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: -1000,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      test('should return 400 for negative on_peak_kw', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: -100,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      test('should return 400 for negative total_kwh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: -100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Invalid Data Types', () => {
      test('should return 400 for string ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 'invalid',
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 'invalid',
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 'invalid',
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string on_peak_kw', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 'invalid',
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string total_kwh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 'invalid'
            }
          });

        expect(response.status).toBe(400);
      });
    });

    describe('Empty Values', () => {
      test('should return 400 for empty tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: '',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType');
      });

      test('should return 400 for empty voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel');
      });

      test('should return 400 for empty ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: '',
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang');
      });

      test('should return 400 for empty peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: '',
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar');
      });

      test('should return 400 for empty highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: '',
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m');
      });

      test('should return 400 for empty usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {}
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: on_peak_kw');
      });
    });

    describe('Null and Undefined Values', () => {
      test('should return 400 for null tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: null,
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType');
      });

      test('should return 400 for undefined voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: undefined,
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel');
      });

      test('should return 400 for null ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: null,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang');
      });
    });
  });

  describe('Calculation Accuracy Tests', () => {
    test('should calculate correct demand charge for >=69kV TOD tariff', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tod',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 200,
          highestDemandChargeLast12m: 60000.00,
          usage: {
            on_peak_kw: 250,
            partial_peak_kw: 200,
            off_peak_kw: 100,
            total_kwh: 100000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual calculation verification:
      // Demand charge = (250 * 224.30) + (200 * 29.91) + (100 * 0) = 56075 + 5982 = 62057
      expect(response.body.calculatedDemandCharge).toBeCloseTo(62057, 1);
      
      // Energy charge = 100000 * 3.1097 = 310970
      expect(response.body.energyCharge).toBeCloseTo(310970, 1);
    });

    test('should calculate correct TOU rates for >=69kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 160,
          highestDemandChargeLast12m: 45000.00,
          usage: {
            on_peak_kw: 200,
            on_peak_kwh: 15000,
            off_peak_kw: 150,
            off_peak_kwh: 25000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual calculation verification:
      // Demand charge = 200 * 74.14 = 14828
      expect(response.body.calculatedDemandCharge).toBeCloseTo(14828, 1);
      
      // Energy charge = (15000 * 4.1025) + (25000 * 2.5849) = 61537.5 + 64622.5 = 126160
      expect(response.body.energyCharge).toBeCloseTo(126160, 1);
    });

    test('should calculate correct VAT', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tod',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 200,
          highestDemandChargeLast12m: 60000.00,
          usage: {
            on_peak_kw: 250,
            partial_peak_kw: 200,
            off_peak_kw: 100,
            total_kwh: 100000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual VAT calculation verification:
      // Subtotal = calculatedDemandCharge + energyCharge + pfCharge + ftCharge
      // VAT = subtotal * 0.07
      expect(response.body.vat).toBeGreaterThan(0);
      expect(response.body.grandTotal).toBeGreaterThan(response.body.subTotal);
    });
  });
});
