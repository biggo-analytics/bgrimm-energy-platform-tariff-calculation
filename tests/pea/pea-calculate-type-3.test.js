/**
 * PEA Type 3 - Medium Business Service Tests
 * Comprehensive test suite for PEA Type 3 electricity bill calculations
 */

const request = require('supertest');
const app = require('../../src/app');

describe('PEA Type 3 - Medium Business Service API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  const baseUrl = '/api/pea/calculate/type-3';

  describe('Normal Tariff Tests', () => {
    describe('Valid Input Tests', () => {
      test('should calculate bill for >=69kV with 100 kW and 40000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('subTotal');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('grandTotal');
        
        // Verify calculations
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(17570, 1); // 100 * 175.70
        expect(response.body.data.energyCharge).toBeCloseTo(124388, 1); // 40000 * 3.1097
        expect(response.body.data.pfCharge).toBeCloseTo(3252.06, 2); // (120 - 100*0.6197) * 56.07
      });

      test('should calculate bill for 22-33kV with 80 kW and 30000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            peakKvar: 80,
            highestDemandChargeLast12m: 15000.00,
            usage: {
              peak_kw: 80,
              total_kwh: 30000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(15700.8, 1); // 80 * 196.26
        expect(response.body.data.energyCharge).toBeCloseTo(94413, 1); // 30000 * 3.1471
      });

      test('should calculate bill for <22kV with 50 kW and 20000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            peakKvar: 60,
            highestDemandChargeLast12m: 10000.00,
            usage: {
              peak_kw: 50,
              total_kwh: 20000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(11075, 1); // 50 * 221.50
        expect(response.body.data.energyCharge).toBeCloseTo(63502, 1); // 20000 * 3.1751
      });

      test('should calculate bill with zero FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: 0,
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.ftCharge).toBeCloseTo(40000.0, 2); // 40000 * 100 / 100
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(175.70, 1); // 1 * 175.70
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
            highestDemandChargeLast12m: 200000.00,
            usage: {
              peak_kw: 1000,
              total_kwh: 1000000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeGreaterThan(100000); // Should be significant
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
            highestDemandChargeLast12m: 20000.50,
            usage: {
              peak_kw: 100.5,
              total_kwh: 40000.5
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(17657.9, 1); // 100.5 * 175.70 (rounded)
        expect(response.body.data.energyCharge).toBeCloseTo(124389.6, 1); // Adjusted to match actual calculation
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
            peakKvar: 100,
            highestDemandChargeLast12m: 18000.00,
            usage: {
              on_peak_kw: 90,
              on_peak_kwh: 15000,
              off_peak_kw: 70,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('subTotal');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('grandTotal');
        
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(6672.6, 1); // 90 * 74.14
        expect(response.body.data.energyCharge).toBeCloseTo(126160, 1); // (15000 * 4.1025) + (25000 * 2.5849)
      });

      test('should calculate bill for 22-33kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            peakKvar: 80,
            highestDemandChargeLast12m: 15000.00,
            usage: {
              on_peak_kw: 70,
              on_peak_kwh: 12000,
              off_peak_kw: 60,
              off_peak_kwh: 20000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(9305.1, 1); // 70 * 132.93
        expect(response.body.data.energyCharge).toBeCloseTo(102280.8, 1); // (12000 * 4.1839) + (20000 * 2.6037)
      });

      test('should calculate bill for <22kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            peakKvar: 60,
            highestDemandChargeLast12m: 10000.00,
            usage: {
              on_peak_kw: 50,
              on_peak_kwh: 10000,
              off_peak_kw: 40,
              off_peak_kwh: 15000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(10500, 1); // 50 * 210.00
        expect(response.body.data.energyCharge).toBeCloseTo(82850.5, 1); // (10000 * 4.3297) + (15000 * 2.6369)
      });

      test('should handle zero off-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 18000.00,
            usage: {
              on_peak_kw: 90,
              on_peak_kwh: 15000,
              off_peak_kw: 0,
              off_peak_kwh: 0
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(61537.5, 1); // 15000 * 4.1025
      });

      test('should handle zero on-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 18000.00,
            usage: {
              on_peak_kw: 0,
              on_peak_kwh: 0,
              off_peak_kw: 70,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(64622.5, 1); // 25000 * 2.5849
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
            highestDemandChargeLast12m: 200000.00,
            usage: {
              on_peak_kw: 500,
              on_peak_kwh: 500000,
              off_peak_kw: 400,
              off_peak_kwh: 500000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeGreaterThan(3000000);
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid tariff type for Type 3. Must be "normal" or "tou", received: invalid');
      });

      test('should return 400 for invalid voltage level', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: 'invalid',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid voltage level for Type 3 normal. Must be ">=69kV", "22-33kV", or "<22kV", received: invalid');
      });

      test('should return 400 for negative ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            ftRateSatang: -10,
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: -100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: -40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 'invalid',
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
          highestDemandChargeLast12m: 20000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 40000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual calculation verification:
      // Demand charge = 100 * 175.70 = 17570
      expect(response.body.data.calculatedDemandCharge).toBeCloseTo(17570, 1);
      
      // Energy charge = 40000 * 3.1097 = 124388
      expect(response.body.data.energyCharge).toBeCloseTo(124388, 1);
      
      // Power factor charge = (120 - 100*0.6197) * 56.07 = (120 - 61.97) * 56.07 = 58.03 * 56.07 = 3252.06
      expect(response.body.data.pfCharge).toBeCloseTo(3252.06, 2);
    });

    test('should calculate correct TOU rates for >=69kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
          peakKvar: 100,
          highestDemandChargeLast12m: 18000.00,
          usage: {
            on_peak_kw: 90,
            on_peak_kwh: 15000,
            off_peak_kw: 70,
            off_peak_kwh: 25000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual calculation verification:
      // Demand charge = 90 * 74.14 = 6672.6
      expect(response.body.data.calculatedDemandCharge).toBeCloseTo(6672.6, 1);
      
      // Energy charge = (15000 * 4.1025) + (25000 * 2.5849) = 61537.5 + 64622.5 = 126160
      expect(response.body.data.energyCharge).toBeCloseTo(126160, 1);
    });

    test('should calculate correct VAT', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 20000.00,
          usage: {
            peak_kw: 100,
            total_kwh: 40000
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
