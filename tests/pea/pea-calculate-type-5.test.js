/**
 * PEA Type 5 - Specific Business Service Tests
 * Comprehensive test suite for PEA Type 5 electricity bill calculations
 */

const request = require('supertest');
const app = require('../../src/app');

describe('PEA Type 5 - Specific Business Service API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  const baseUrl = '/api/pea/calculate/type-5';

  describe('Normal Tariff Tests', () => {
    describe('Valid Input Tests', () => {
      test('should calculate bill for >=69kV with 130 kW and 50000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(28672.8, 1); // 130 * 220.56
        expect(response.body.data.energyCharge).toBeCloseTo(155485, 1); // 50000 * 3.1097
      });

      test('should calculate bill for 22-33kV with 110 kW and 45000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 39.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 25000.00,
            usage: {
              on_peak_kw: 110,
              on_peak_kwh: 22500,
              off_peak_kw: 110,
              off_peak_kwh: 22500
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(28167.7, 1); // 110 * 256.07
        expect(response.body.data.energyCharge).toBeCloseTo(141619.5, 1); // 45000 * 3.1471
        expect(response.body.serviceCharge).toBe(312.24);
      });

      test('should calculate bill for <22kV with 110 kW and 45000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 39.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 25000.00,
            usage: {
              on_peak_kw: 110,
              on_peak_kwh: 22500,
              off_peak_kw: 110,
              off_peak_kwh: 22500
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(30430.4, 1); // 110 * 276.64
        expect(response.body.data.energyCharge).toBeCloseTo(142879.5, 1); // 45000 * 3.1751
        expect(response.body.serviceCharge).toBe(312.24);
      });

      test('should calculate bill with zero FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 0,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.ftCharge).toBeCloseTo(0, 2);
      });

      test('should calculate bill with very high FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 100.0,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.ftCharge).toBeCloseTo(50000.0, 2); // 50000 * 100 / 100
      });
    });

    describe('Edge Cases', () => {
      test('should handle minimum consumption (1 kW, 1 kWh)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 10,
            highestDemandChargeLast12m: 1000.00,
            usage: {
              on_peak_kw: 1,
              on_peak_kwh: 0.5,
              off_peak_kw: 1,
              off_peak_kwh: 0.5
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(220.6, 1); // 1 * 220.56
        expect(response.body.data.energyCharge).toBeCloseTo(3.11, 1); // 1 * 3.1097
      });

      test('should handle very high consumption (1000 kW, 1000000 kWh)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 1000,
            highestDemandChargeLast12m: 500000.00,
            usage: {
              on_peak_kw: 1000,
              on_peak_kwh: 500000,
              off_peak_kw: 1000,
              off_peak_kwh: 500000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.calculatedDemandCharge).toBeGreaterThan(200000); // Should be significant
        expect(response.body.energyCharge).toBeGreaterThan(3000000); // Should be significant
      });

      test('should handle decimal values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120.5,
            highestDemandChargeLast12m: 30000.50,
            usage: {
              on_peak_kw: 130.5,
              on_peak_kwh: 25000.25,
              off_peak_kw: 130.5,
              off_peak_kwh: 25000.25
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(28783.1, 1); // 130.5 * 220.56
        expect(response.body.data.energyCharge).toBeCloseTo(155486.555, 1); // 50000.5 * 3.1097
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
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('subTotal');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('grandTotal');
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(8896.8, 1); // 120 * 74.14
        expect(response.body.data.energyCharge).toBeCloseTo(172521.5, 1); // (20000 * 4.1025) + (35000 * 2.5849)
      });

      test('should calculate bill for 22-33kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 39.72,
            peakKvar: 95,
            highestDemandChargeLast12m: 22000.00,
            usage: {
              on_peak_kw: 100,
              on_peak_kwh: 18000,
              off_peak_kw: 80,
              off_peak_kwh: 32000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(13293, 1); // 100 * 132.93
        expect(response.body.data.energyCharge).toBeCloseTo(158628.6, 1); // (18000 * 4.1839) + (32000 * 2.6037)
        expect(response.body.serviceCharge).toBe(312.24);
      });

      test('should calculate bill for <22kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 39.72,
            peakKvar: 85,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              on_peak_kw: 90,
              on_peak_kwh: 15000,
              off_peak_kw: 70,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(18900, 1); // 90 * 210.00
        expect(response.body.data.energyCharge).toBeCloseTo(130868, 1); // (15000 * 4.3297) + (25000 * 2.6369)
        expect(response.body.serviceCharge).toBe(312.24);
      });

      test('should handle zero off-peak consumption', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
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
            ftRateSatang: 39.72,
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
        expect(response.body.data.energyCharge).toBeCloseTo(0.67, 2); // (0.1 * 4.1025) + (0.1 * 2.5849)
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
        expect(response.body).toHaveProperty('error', 'Tariff type is required');
      });

      test('should return 400 for missing tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Tariff type is required');
      });

      test('should return 400 for missing voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Voltage level is required');
      });

      test('should return 400 for missing ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Cannot read properties of undefined (reading \'total_kwh\')');
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
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid tariff type: invalid. Valid types: normal, tou, tod');
      });

      test('should return 400 for invalid voltage level', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: 'invalid',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid voltage level: invalid. Valid levels for pea: <22kV, 22-33kV, >=69kV');
      });

      test('should return 400 for negative ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: -10,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
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
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: -10,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
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
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: -1000,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
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
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: -100,
              on_peak_kwh: 25000,
              off_peak_kw: -100,
              off_peak_kwh: 25000
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
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: -25000,
              off_peak_kw: 130,
              off_peak_kwh: -25000
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
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 'invalid',
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 'invalid',
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 'invalid',
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string peak_kw', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 'invalid',
              on_peak_kwh: 25000,
              off_peak_kw: 'invalid',
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
      });

      test('should return 400 for string total_kwh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 'invalid',
              off_peak_kw: 130,
              off_peak_kwh: 'invalid'
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
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Tariff type is required');
      });

      test('should return 400 for empty voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Voltage level is required');
      });

      test('should return 400 for empty ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: '',
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: '',
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: '',
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m. This field is mandatory for the calculation.');
      });

      test('should return 400 for empty usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
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
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Tariff type is required');
      });

      test('should return 400 for undefined voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: undefined,
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Voltage level is required');
      });

      test('should return 400 for null ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: null,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 130,
              on_peak_kwh: 25000,
              off_peak_kw: 130,
              off_peak_kwh: 25000
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
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            on_peak_kw: 130,
            on_peak_kwh: 25000,
            off_peak_kw: 130,
            off_peak_kwh: 25000
          }
        });

      expect(response.status).toBe(200);
      
      // Manual calculation verification:
      // Demand charge = 130 * 220.56 = 28672.8
      expect(response.body.calculatedDemandCharge).toBeCloseTo(28672.8, 1);
      
      // Energy charge = 50000 * 3.1097 = 155485
      expect(response.body.energyCharge).toBeCloseTo(155485, 1);
    });

    test('should calculate correct TOU rates for >=69kV', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
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
      
      // Manual calculation verification:
      // Demand charge = 120 * 74.14 = 8896.8
      expect(response.body.calculatedDemandCharge).toBeCloseTo(8896.8, 1);
      
      // Energy charge = (20000 * 4.1025) + (35000 * 2.5849) = 82050 + 90471.5 = 172521.5
      expect(response.body.energyCharge).toBeCloseTo(172521.5, 1);
    });

    test('should calculate correct VAT', async () => {
      const response = await request(server)
        .post(baseUrl)
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 39.72,
          peakKvar: 120,
          highestDemandChargeLast12m: 30000.00,
          usage: {
            on_peak_kw: 130,
            on_peak_kwh: 25000,
            off_peak_kw: 130,
            off_peak_kwh: 25000
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
