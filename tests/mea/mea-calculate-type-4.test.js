/**
 * MEA Type 4 - Large General Service Tests
 * Comprehensive test suite for MEA Type 4 electricity bill calculations
 */

const request = require('supertest');
const app = require('../../src/app');

describe('MEA Type 4 - Large General Service API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  const baseUrl = '/api/v2/mea/calculate/type-4';

  describe('TOD Tariff Tests', () => {
    describe('Valid Input Tests', () => {
      test('should calculate bill for >=69kV TOD', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('subTotal');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('grandTotal');
        
        // Verify calculations: (250 * 280.00) + (200 * 74.14) + (100 * 0) = 70000 + 14828 = 84828
        expect(response.body.calculatedDemandCharge).toBeCloseTo(84828, 1);
        expect(response.body.energyCharge).toBeCloseTo(310970, 1); // 100000 * 3.1097
      });

      test('should calculate bill for 12-24kV TOD', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            peakKvar: 180,
            highestDemandChargeLast12m: 50000.00,
            usage: {
              on_peak_kw: 200,
              partial_peak_kw: 180,
              off_peak_kw: 50,
              total_kwh: 80000
            }
          });

        expect(response.status).toBe(200);
        // (200 * 334.33) + (180 * 132.93) + (50 * 0) = 66866 + 23927.4 = 90793.4
        expect(response.body.calculatedDemandCharge).toBeCloseTo(90793.4, 1);
        expect(response.body.energyCharge).toBeCloseTo(250168, 1); // 80000 * 3.1271
      });

      test('should calculate bill for <12kV TOD', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            peakKvar: 160,
            highestDemandChargeLast12m: 40000.00,
            usage: {
              on_peak_kw: 180,
              partial_peak_kw: 150,
              off_peak_kw: 80,
              total_kwh: 60000
            }
          });

        expect(response.status).toBe(200);
        // (180 * 352.71) + (150 * 210.80) + (80 * 0) = 63487.8 + 31620 = 95107.8
        expect(response.body.calculatedDemandCharge).toBeCloseTo(95107.8, 1);
        expect(response.body.energyCharge).toBeCloseTo(190506, 1); // 60000 * 3.1751
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
            ftRateSatang: 19.72,
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(354.14, 1); // (1 * 280.00) + (1 * 74.14) + (1 * 0)
        expect(response.body.energyCharge).toBeCloseTo(3.11, 1); // 1 * 3.1097
      });

      test('should handle very high consumption (1000 kW each, 1000000 kWh)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
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
        expect(response.body.calculatedDemandCharge).toBeGreaterThan(300000); // Should be significant
        expect(response.body.energyCharge).toBeGreaterThan(3000000); // Should be significant
      });

      test('should handle decimal values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(85005.1, 1); // (250.5 * 280.00) + (200.5 * 74.14) + (100.5 * 0)
        expect(response.body.energyCharge).toBeCloseTo(310971.6, 1); // Adjusted to match actual calculation
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
            peakKvar: 150,
            highestDemandChargeLast12m: 45000.00,
            usage: {
              on_peak_kw: 200,
              on_peak_kwh: 30000,
              off_peak_kw: 150,
              off_peak_kwh: 50000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('calculatedDemandCharge');
        expect(response.body).toHaveProperty('energyCharge');
        expect(response.body).toHaveProperty('effectiveDemandCharge');
        expect(response.body).toHaveProperty('pfCharge');
        expect(response.body).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('subTotal');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('grandTotal');
      });

      test('should calculate bill for 12-24kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 35000.00,
            usage: {
              on_peak_kw: 150,
              on_peak_kwh: 25000,
              off_peak_kw: 120,
              off_peak_kwh: 40000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.calculatedDemandCharge).toBeCloseTo(19939.5, 1); // 150 * 132.93
        expect(response.body.energyCharge).toBeCloseTo(208745.5, 1); // (25000 * 4.1839) + (40000 * 2.6037)
      });

      test('should calculate bill for <12kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 25000.00,
            usage: {
              on_peak_kw: 120,
              on_peak_kwh: 20000,
              off_peak_kw: 100,
              off_peak_kwh: 30000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.calculatedDemandCharge).toBeCloseTo(25296, 1); // 120 * 210.80 (rounded)
        expect(response.body.energyCharge).toBeCloseTo(169701, 1); // (20000 * 4.5297) + (30000 * 2.6369)
      });

      test('should handle zero off-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 150,
            highestDemandChargeLast12m: 45000.00,
            usage: {
              on_peak_kw: 200,
              on_peak_kwh: 30000,
              off_peak_kw: 0,
              off_peak_kwh: 0
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(123075, 1); // 30000 * 4.1025
      });

      test('should handle zero on-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 150,
            highestDemandChargeLast12m: 45000.00,
            usage: {
              on_peak_kw: 0,
              on_peak_kwh: 0,
              off_peak_kw: 150,
              off_peak_kwh: 50000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(129245, 1); // 50000 * 2.5849
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
        expect(response.body.energyCharge).toBeCloseTo(0.67, 2); // (0.1 * 4.1025) + (0.1 * 2.5849)
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
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
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
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 200,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 60000.00
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
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Invalid voltage level for Type 4 tod. Must be ">=69kV", "12-24kV", or "<12kV", received: invalid');
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
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '',
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
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
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
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
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for undefined voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: undefined,
            ftRateSatang: 19.72,
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
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
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
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
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
          ftRateSatang: 19.72,
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
      // Demand charge = (250 * 280.00) + (200 * 74.14) + (100 * 0) = 70000 + 14828 = 84828
      expect(response.body.calculatedDemandCharge).toBeCloseTo(84828, 1);
      
      // Energy charge = 100000 * 3.1097 = 310970
      expect(response.body.energyCharge).toBeCloseTo(310970, 1);
    });

    test('should calculate correct TOU rates for >=69kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
          peakKvar: 150,
          highestDemandChargeLast12m: 45000.00,
          usage: {
            on_peak_kw: 200,
            on_peak_kwh: 30000,
            off_peak_kw: 150,
            off_peak_kwh: 50000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual calculation verification:
      // Demand charge = 200 * 74.14 = 14828
      expect(response.body.calculatedDemandCharge).toBeCloseTo(14828, 1);
      
      // Energy charge = (30000 * 4.1025) + (50000 * 2.5849) = 123075 + 129245 = 252320
      expect(response.body.energyCharge).toBeCloseTo(252320, 1);
    });

    test('should calculate correct VAT', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tod',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
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
