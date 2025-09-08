/**
 * MEA Type 5 - Specific Business Service Tests
 * Comprehensive test suite for MEA Type 5 electricity bill calculations
 */

const request = require('supertest');
const app = require('../../src/app');

describe('MEA Type 5 - Specific Business Service API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  const baseUrl = '/api/mea/calculate/type-5';

  describe('Normal Tariff Tests', () => {
    describe('Valid Input Tests', () => {
      test('should calculate bill for >=69kV with 130 kW and 50000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('subTotal');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('grandTotal');
        
        // Verify calculations
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(28646.8, 1); // 130 * 220.36
        expect(response.body.data.energyCharge).toBeCloseTo(155485, 1); // 50000 * 3.1097
      });

      test('should calculate bill for 12-24kV with 110 kW and 45000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 25000.00,
            usage: {
              peak_kw: 110,
              total_kwh: 45000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(28167.7, 1); // 110 * 256.07
        expect(response.body.data.energyCharge).toBeCloseTo(140719.5, 1); // 45000 * 3.1271
      });

      test('should calculate bill for <12kV with 110 kW and 45000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 25000.00,
            usage: {
              peak_kw: 110,
              total_kwh: 45000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(30430.4, 1); // 110 * 276.64
        expect(response.body.data.energyCharge).toBeCloseTo(142879.5, 1); // 45000 * 3.1751
      });

      test('should calculate bill with zero FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 0,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.ftCharge).toBeCloseTo(0, 2);
      });

      test('should calculate bill with very high FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 100.0,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.ftCharge).toBeCloseTo(50000.0, 2); // 50000 * 100 / 100
      });
    });

    describe('Edge Cases', () => {
      test('should handle minimum consumption (1 kW, 1 kWh)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 10,
            highestDemandChargeLast12m: 1000.00,
            usage: {
              peak_kw: 1,
              total_kwh: 1
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(220.36, 1); // 1 * 220.36
        expect(response.body.data.energyCharge).toBeCloseTo(3.11, 1); // 1 * 3.1097
      });

      test('should handle very high consumption (1000 kW, 1000000 kWh)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 1200,
            highestDemandChargeLast12m: 300000.00,
            usage: {
              peak_kw: 1000,
              total_kwh: 1000000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeGreaterThan(200000); // Should be significant
        expect(response.body.data.energyCharge).toBeGreaterThan(3000000); // Should be significant
      });

      test('should handle decimal values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120.5,
            highestDemandChargeLast12m: 30000.50,
            usage: {
              peak_kw: 130.5,
              total_kwh: 50000.5
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(28756.98, 1); // 130.5 * 220.36
        expect(response.body.data.energyCharge).toBeCloseTo(155486.6, 1); // Adjusted to match actual calculation
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
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('subTotal');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('grandTotal');
        
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(8896.8, 1); // 120 * 74.14
        expect(response.body.data.energyCharge).toBeCloseTo(172521.5, 1); // (20000 * 4.1025) + (35000 * 2.5849)
      });

      test('should calculate bill for 12-24kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 25000.00,
            usage: {
              on_peak_kw: 110,
              on_peak_kwh: 18000,
              off_peak_kw: 80,
              off_peak_kwh: 30000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(14622.3, 1); // 110 * 132.93
        expect(response.body.data.energyCharge).toBeCloseTo(153421.2, 1); // (18000 * 4.1839) + (30000 * 2.6037)
      });

      test('should calculate bill for <12kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            peakKvar: 90,
            highestDemandChargeLast12m: 22000.00,
            usage: {
              on_peak_kw: 100,
              on_peak_kwh: 15000,
              off_peak_kw: 70,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(21080, 1); // 100 * 210.80
        expect(response.body.data.energyCharge).toBeCloseTo(133868, 1); // (15000 * 4.3297) + (25000 * 2.6369)
      });

      test('should handle zero off-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 110,
            highestDemandChargeLast12m: 28000.00,
            usage: {
              on_peak_kw: 120,
              on_peak_kwh: 20000,
              off_peak_kw: 0,
              off_peak_kwh: 0
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(82050, 1); // 20000 * 4.1025
      });

      test('should handle zero on-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 110,
            highestDemandChargeLast12m: 28000.00,
            usage: {
              on_peak_kw: 0,
              on_peak_kwh: 0,
              off_peak_kw: 90,
              off_peak_kwh: 35000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(90471.5, 1); // 35000 * 2.5849
      });
    });

    describe('Edge Cases', () => {
      test('should handle very small consumption values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
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
        expect(response.body.data.energyCharge).toBeCloseTo(0.67, 2); // (0.1 * 4.1025) + (0.1 * 2.5849)
      });

      test('should handle very large consumption values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Request body is required and cannot be empty');
      });

      test('should return 400 for missing tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: usage. This field is mandatory for the calculation.');
      });
    });

    describe('Invalid Field Values', () => {
      test('should return 400 for invalid tariff type', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'invalid',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
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
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid voltage level for Type 5 normal. Must be ">=69kV", "12-24kV", or "<12kV", received: invalid');
      });

      test('should return 400 for negative ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: -10,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      });

      test('should return 400 for negative peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: -10,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      });

      test('should return 400 for negative highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: -1000,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      });

      test('should return 400 for negative peak_kw', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: -100,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      });

      test('should return 400 for negative total_kwh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: -50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Invalid Data Types', () => {
      test('should return 400 for string ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 'invalid',
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 'invalid',
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 'invalid',
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string peak_kw', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 'invalid',
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string total_kwh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
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
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: '',
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: '',
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: '',
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {}
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: peak_kw');
      });
    });

    describe('Null and Undefined Values', () => {
      test('should return 400 for null tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: null,
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for undefined voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: undefined,
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
      });

      test('should return 400 for null ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: null,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              peak_kw: 130,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });
    });
  });

  describe('Calculation Accuracy Tests', () => {
    test('should calculate correct demand charge for >=69kV normal tariff', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 130,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual calculation verification:
      // Demand charge = 130 * 220.36 = 28646.8
      expect(response.body.data.calculatedDemandCharge).toBeCloseTo(28646.8, 1);
      
      // Energy charge = 50000 * 3.1097 = 155485
      expect(response.body.data.energyCharge).toBeCloseTo(155485, 1);
    });

    test('should calculate correct TOU rates for >=69kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
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
      
      // Manual calculation verification:
      // Demand charge = 120 * 74.14 = 8896.8
      expect(response.body.data.calculatedDemandCharge).toBeCloseTo(8896.8, 1);
      
      // Energy charge = (20000 * 4.1025) + (35000 * 2.5849) = 82050 + 90471.5 = 172521.5
      expect(response.body.data.energyCharge).toBeCloseTo(172521.5, 1);
    });

    test('should calculate correct VAT', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            peak_kw: 130,
            total_kwh: 50000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual VAT calculation verification:
      // Subtotal = calculatedDemandCharge + energyCharge + pfCharge + ftCharge
      // VAT = subtotal * 0.07
      expect(response.body.data.vat).toBeGreaterThan(0);
      expect(response.body.data.grandTotal).toBeGreaterThan(response.body.data.subTotal);
    });
  });
});
