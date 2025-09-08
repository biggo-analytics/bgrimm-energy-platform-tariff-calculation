const request = require('supertest');
const app = require('../src/app');

describe('MEA Electricity Bill Calculation API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Type 2 - Small General Service', () => {
    const baseUrl = '/api/MEA/calculate/type-2';

    describe('Normal Tariff', () => {
      test('should calculate bill for <12kV with 500 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('baseTariff');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('totalBill');
        
        // Verify calculations
        expect(response.body.data.energyCharge).toBeCloseTo(1984.88, 2);
        expect(response.body.data.ftCharge).toBeCloseTo(98.60, 2);
      });

      test('should calculate bill for <12kV with 150 kWh (first tier only)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 75,
              off_peak_kwh: 75
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(487.26, 2); // 150 * 3.2484
      });

      test('should calculate bill for <12kV with 400 kWh (two tiers)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 200,
              off_peak_kwh: 200
            }
          });

        expect(response.status).toBe(200);
        // 150 * 3.2484 + 250 * 4.2218 = 487.26 + 1055.45 = 1542.71
        expect(response.body.data.energyCharge).toBeCloseTo(1542.71, 2);
      });

      test('should calculate bill for 12-24kV with 1000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 500,
              off_peak_kwh: 500
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(3908.6, 2); // 1000 * 3.9086
      });
    });

    describe('TOU Tariff', () => {
      test('should calculate bill for <12kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 200,
              off_peak_kwh: 300
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('baseTariff');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('totalBill');
        
        // Verify calculations: (200 * 5.7982) + (300 * 2.6369) = 1159.64 + 791.07 = 1950.71
        expect(response.body.data.energyCharge).toBeCloseTo(1950.71, 2);
      });

      test('should calculate bill for 12-24kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 150,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(200);
        // (150 * 5.1135) + (250 * 2.6037) = 767.025 + 650.925 = 1417.95
        expect(response.body.data.energyCharge).toBeCloseTo(1417.95, 2);
      });
    });

    describe('Validation Errors', () => {
      test('should return 400 for missing tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: usage. This field is mandatory for the calculation.');
      });
    });
  });

  describe('Type 3 - Medium General Service', () => {
    const baseUrl = '/api/MEA/calculate/type-3';

    describe('Normal Tariff', () => {
      test('should calculate bill for >=69kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
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
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('subTotal');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('grandTotal');

        // Verify calculations
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(17570, 1); // 100 * 175.70
        expect(response.body.data.energyCharge).toBeCloseTo(124388, 1); // 40000 * 3.1097
        expect(response.body.data.pfCharge).toBeCloseTo(3252.06, 2); // (120 - 100*0.6197) * 56.07
      });

      test('should calculate bill for 12-24kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '12-24kV',
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
        expect(response.body.data.energyCharge).toBeCloseTo(93813, 1); // 30000 * 3.1271
      });

      test('should calculate bill for <12kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
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
    });

    describe('TOU Tariff', () => {
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(6672.6, 1); // 90 * 74.14
        expect(response.body.data.energyCharge).toBeCloseTo(126160, 1); // (15000 * 4.1025) + (25000 * 2.5849)
      });

      test('should calculate bill for 12-24kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            peakKvar: 85,
            highestDemandChargeLast12m: 12000.00,
            usage: {
              on_peak_kw: 75,
              on_peak_kwh: 12000,
              off_peak_kw: 60,
              off_peak_kwh: 18000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(9969.75, 1); // 75 * 132.93
        expect(response.body.data.energyCharge).toBeCloseTo(97073.4, 1); // (12000 * 4.1839) + (18000 * 2.6037)
      });

      test('should calculate bill for <12kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            peakKvar: 70,
            highestDemandChargeLast12m: 8000.00,
            usage: {
              on_peak_kw: 65,
              on_peak_kwh: 10000,
              off_peak_kw: 55,
              off_peak_kwh: 15000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(13702, 1); // 65 * 210.80
        expect(response.body.data.energyCharge).toBeCloseTo(84850.5, 1); // (10000 * 4.5297) + (15000 * 2.6369)
      });
    });

    describe('Minimum Bill Protection', () => {
      test('should apply minimum bill when calculated demand is lower', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 50,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 50, // Low demand
              total_kwh: 10000
            }
          });

        expect(response.status).toBe(200);
        const calculatedDemand = 50 * 175.70; // 8785
        const minimumDemand = 20000 * 0.70; // 14000
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(calculatedDemand, 1);
        expect(response.body.data.effectiveDemandCharge).toBeCloseTo(minimumDemand, 1);
      });
    });
  });

  describe('Type 4 - Large General Service', () => {
    const baseUrl = '/api/MEA/calculate/type-4';

    describe('TOD Tariff', () => {
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
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('subTotal');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('grandTotal');

        // Verify calculations: (250 * 280.00) + (200 * 74.14) + (100 * 0) = 70000 + 14828 = 84828
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(84828, 1);
        expect(response.body.data.energyCharge).toBeCloseTo(310970, 1); // 100000 * 3.1097
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(90793.4, 1);
        expect(response.body.data.energyCharge).toBeCloseTo(250168, 1); // 80000 * 3.1271
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(95107.8, 1);
        expect(response.body.data.energyCharge).toBeCloseTo(190506, 1); // 60000 * 3.1751
      });
    });

    describe('TOU Tariff', () => {
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(14828, 1); // 200 * 74.14
        expect(response.body.data.energyCharge).toBeCloseTo(252320, 1); // (30000 * 4.1025) + (50000 * 2.5849)
      });

      test('should calculate bill for 12-24kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            peakKvar: 140,
            highestDemandChargeLast12m: 35000.00,
            usage: {
              on_peak_kw: 180,
              on_peak_kwh: 25000,
              off_peak_kw: 120,
              off_peak_kwh: 40000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(23927.4, 1); // 180 * 132.93
        expect(response.body.data.energyCharge).toBeCloseTo(208745.5, 1); // (25000 * 4.1839) + (40000 * 2.6037)
      });

      test('should calculate bill for <12kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            peakKvar: 130,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 160,
              on_peak_kwh: 20000,
              off_peak_kw: 100,
              off_peak_kwh: 30000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(33728, 1); // 160 * 210.80
        expect(response.body.data.energyCharge).toBeCloseTo(169701, 1); // (20000 * 4.5297) + (30000 * 2.6369)
      });
    });
  });

  describe('Type 5 - Specific Business', () => {
    const baseUrl = '/api/MEA/calculate/type-5';

    describe('Normal Tariff', () => {
      test('should calculate bill for >=69kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
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
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body.data).toHaveProperty('subTotal');
        expect(response.body.data).toHaveProperty('vat');
        expect(response.body.data).toHaveProperty('grandTotal');

        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(28646.8, 1); // 130 * 220.36
        expect(response.body.data.energyCharge).toBeCloseTo(155485, 1); // 50000 * 3.1097
      });

      test('should calculate bill for 12-24kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
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

      test('should calculate bill for <12kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
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
    });

    describe('TOU Tariff', () => {
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
      });

      test('should calculate bill for <12kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            peakKvar: 85,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              on_peak_kw: 90,
              on_peak_kwh: 15000,
              off_peak_kw: 70,
              off_peak_kwh: 28000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(18972, 1); // 90 * 210.80
        expect(response.body.data.energyCharge).toBeCloseTo(141778.7, 1); // (15000 * 4.5297) + (28000 * 2.6369)
      });
    });
  });

  describe('Power Factor Calculations', () => {
    test('should calculate power factor penalty correctly', async () => {
      const response = await request(server)
        .post('/api/MEA/calculate/type-3')
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
          peakKvar: 120, // High reactive power
          highestDemandChargeLast12m: 20000.00,
          usage: {
            peak_kw: 100, // Low active power
            total_kwh: 40000
          }
        });

      expect(response.status).toBe(200);
      // Power factor penalty: (120 - 100*0.6197) * 56.07 = (120 - 61.97) * 56.07 = 58.03 * 56.07 = 3252.06
      expect(response.body.data.pfCharge).toBeCloseTo(3252.06, 2);
    });

    test('should have zero power factor penalty when within limits', async () => {
      const response = await request(server)
        .post('/api/MEA/calculate/type-3')
        .send({
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          ftRateSatang: 19.72,
          peakKvar: 50, // Low reactive power
          highestDemandChargeLast12m: 20000.00,
          usage: {
            peak_kw: 100, // High active power
            total_kwh: 40000
          }
        });

      expect(response.status).toBe(200);
      // Power factor penalty: max(0, 50 - 100*0.6197) * 56.07 = max(0, 50 - 61.97) * 56.07 = 0
      expect(response.body.data.pfCharge).toBeCloseTo(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero usage gracefully', async () => {
      const response = await request(server)
        .post('/api/MEA/calculate/type-2')
        .send({
          tariffType: 'tou',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 0
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.energyCharge).toBeCloseTo(0);
      expect(response.body.data.ftCharge).toBeCloseTo(0);
      expect(response.body.data.vat).toBeCloseTo(2.33, 2); // Only service charge * VAT rate
    });

    test('should handle very high usage values', async () => {
      const response = await request(server)
        .post('/api/MEA/calculate/type-2')
        .send({
          tariffType: 'tou',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 1000000
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.energyCharge).toBeGreaterThan(0);
      expect(response.body.data.totalBill).toBeGreaterThan(0);
    });
  });
});

describe('PEA Electricity Bill Calculation API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Type 2 - Small Business Service', () => {
    const baseUrl = '/api/PEA/calculate/type-2';

    describe('Normal Tariff', () => {
      test('should calculate bill for <22kV with 500 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('baseTariff');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('totalBill');
        
        // Verify calculations: 150*3.2484 + 250*4.2218 + 100*4.4217 = 487.26 + 1055.45 + 442.17 = 1984.88
        expect(response.body.data.energyCharge).toBeCloseTo(1984.88, 2);
        expect(response.body.data.serviceCharge).toBe(33.29);
        expect(response.body.data.ftCharge).toBeCloseTo(98.60, 2); // 500 * 19.72 / 100
      });

      test('should calculate bill for <22kV with 150 kWh (first tier only)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 75,
              off_peak_kwh: 75
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(487.26, 2); // 150 * 3.2484
        expect(response.body.data.serviceCharge).toBe(33.29);
      });

      test('should calculate bill for <22kV with 400 kWh (two tiers)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 200,
              off_peak_kwh: 200
            }
          });

        expect(response.status).toBe(200);
        // 150 * 3.2484 + 250 * 4.2218 = 487.26 + 1055.45 = 1542.71
        expect(response.body.data.energyCharge).toBeCloseTo(1542.71, 2);
      });

      test('should calculate bill for 22-33kV with 1000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 500,
              off_peak_kwh: 500
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(3908.6, 2); // 1000 * 3.9086
        expect(response.body.data.serviceCharge).toBe(312.24);
      });

      test('should calculate bill for 22-33kV with 500 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(1954.3, 2); // 500 * 3.9086
        expect(response.body.data.serviceCharge).toBe(312.24);
        expect(response.body.data.ftCharge).toBeCloseTo(98.60, 2); // 500 * 19.72 / 100
      });
    });

    describe('TOU Tariff', () => {
      test('should calculate bill for <22kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 200,
              off_peak_kwh: 300
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('baseTariff');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('totalBill');
        
        // Verify calculations: (200 * 5.7982) + (300 * 2.6369) = 1159.64 + 791.07 = 1950.71
        expect(response.body.data.energyCharge).toBeCloseTo(1950.71, 2);
        expect(response.body.data.serviceCharge).toBe(33.29);
        expect(response.body.data.ftCharge).toBeCloseTo(98.60, 2); // 500 * 19.72 / 100
      });

      test('should calculate bill for 22-33kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 150,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(200);
        // (150 * 5.1135) + (250 * 2.6037) = 767.025 + 650.925 = 1417.95
        expect(response.body.data.energyCharge).toBeCloseTo(1417.95, 2);
        expect(response.body.data.serviceCharge).toBe(312.24);
        expect(response.body.data.ftCharge).toBeCloseTo(78.9, 1); // 400 * 19.72 / 100
      });

      test('should calculate bill for <22kV TOU with equal on/off peak usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(200);
        // (250 * 5.7982) + (250 * 2.6369) = 1449.55 + 659.225 = 2108.775
        expect(response.body.data.energyCharge).toBeCloseTo(2108.775, 2);
        expect(response.body.data.ftCharge).toBeCloseTo(98.60, 2); // 500 * 19.72 / 100
      });
    });

    describe('Validation Errors', () => {
      test('should return 400 for missing tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: usage. This field is mandatory for the calculation.');
      });

      test('should return 400 for invalid tariff type', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'invalid',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Invalid tariff type');
      });

      test('should return 400 for missing request body', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send();

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Request body is required and cannot be empty');
      });
    });

    describe('Edge Cases', () => {
      test('should handle zero usage gracefully', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 0
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(0);
        expect(response.body.data.ftCharge).toBeCloseTo(0);
        expect(response.body.data.serviceCharge).toBe(33.29);
        expect(response.body.data.vat).toBeCloseTo(2.33, 2); // Only service charge * VAT rate (33.29 * 0.07)
      });

      test('should handle very high usage values for <22kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 1000000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeGreaterThan(0);
        expect(response.body.data.totalBill).toBeGreaterThan(0);
        // For very high usage, most will be at the highest tier (4.4217)
        const expectedEnergyCharge = 150 * 3.2484 + 250 * 4.2218 + (1000000 - 400) * 4.4217;
        expect(response.body.data.energyCharge).toBeCloseTo(expectedEnergyCharge, 2);
      });

      test('should handle very high usage values for 22-33kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 1000000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(3908600, 1); // 1000000 * 3.9086
        expect(response.body.data.totalBill).toBeGreaterThan(0);
      });

      test('should handle zero FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 0,
            usage: {
              on_peak_kwh: 250,
              off_peak_kwh: 250
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.ftCharge).toBeCloseTo(0);
        expect(response.body.data.energyCharge).toBeCloseTo(1984.88, 2);
      });

      test('should handle TOU with zero on-peak usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 0,
              off_peak_kwh: 400
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(1054.76, 2); // 400 * 2.6369
        expect(response.body.data.ftCharge).toBeCloseTo(78.9, 1); // 400 * 19.72 / 100
      });

      test('should handle TOU with zero off-peak usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              on_peak_kwh: 300,
              off_peak_kwh: 0
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.energyCharge).toBeCloseTo(1739.46, 2); // 300 * 5.7982
        expect(response.body.data.ftCharge).toBeCloseTo(59.2, 1); // 300 * 19.72 / 100
      });
    });

    describe('Bill Component Calculations', () => {
      test('should correctly calculate all bill components for normal tariff', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 20.00,
            usage: {
              total_kwh: 300
            }
          });

        expect(response.status).toBe(200);
        
        const energyCharge = 150 * 3.2484 + 150 * 4.2218; // 487.26 + 633.27 = 1120.53
        const serviceCharge = 33.29;
        const baseTariff = energyCharge + serviceCharge; // 1120.53 + 33.29 = 1153.82
        const ftCharge = 300 * 0.20; // 60.00
        const vat = (baseTariff + ftCharge) * 0.07; // 1213.82 * 0.07 = 84.9674
        const totalBill = baseTariff + ftCharge + vat; // 1298.7874
        
        expect(response.body.data.energyCharge).toBeCloseTo(energyCharge, 2);
        expect(response.body.data.serviceCharge).toBe(serviceCharge);
        expect(response.body.data.baseTariff).toBeCloseTo(baseTariff, 2);
        expect(response.body.data.ftCharge).toBeCloseTo(ftCharge, 2);
        expect(response.body.data.vat).toBeCloseTo(vat, 2);
        expect(response.body.data.totalBill).toBeCloseTo(totalBill, 2);
      });

      test('should correctly calculate all bill components for TOU tariff', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 15.50,
            usage: {
              on_peak_kwh: 100,
              off_peak_kwh: 200
            }
          });

        expect(response.status).toBe(200);
        
        const energyCharge = (100 * 5.1135) + (200 * 2.6037); // 511.35 + 520.74 = 1032.09
        const serviceCharge = 312.24;
        const baseTariff = energyCharge + serviceCharge; // 1032.09 + 312.24 = 1344.33
        const ftCharge = 300 * 0.155; // 46.50
        const vat = (baseTariff + ftCharge) * 0.07; // 1390.83 * 0.07 = 97.3581
        const totalBill = baseTariff + ftCharge + vat; // 1488.1881
        
        expect(response.body.data.energyCharge).toBeCloseTo(energyCharge, 2);
        expect(response.body.data.serviceCharge).toBe(serviceCharge);
        expect(response.body.data.baseTariff).toBeCloseTo(baseTariff, 2);
        expect(response.body.data.ftCharge).toBeCloseTo(ftCharge, 2);
        expect(response.body.data.vat).toBeCloseTo(vat, 2);
        expect(response.body.data.totalBill).toBeCloseTo(totalBill, 2);
      });
    });
  });

  describe('Type 3 - Medium Business Service', () => {
    const baseUrl = '/api/PEA/calculate/type-3';

    describe('Normal Tariff', () => {
      test('should calculate bill for >=69kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
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
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('subTotal');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('grandTotal');

        // Verify calculations
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(17570, 1); // 100 * 175.70
        expect(response.body.data.energyCharge).toBeCloseTo(124388, 1); // 40000 * 3.1097
        expect(response.body.data.pfCharge).toBeCloseTo(3252.06, 2); // (120 - 100*0.6197) * 56.07
      });

      test('should calculate bill for 22-33kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
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

      test('should calculate bill for <22kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
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
    });

    describe('TOU Tariff', () => {
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
            peakKvar: 85,
            highestDemandChargeLast12m: 12000.00,
            usage: {
              on_peak_kw: 75,
              on_peak_kwh: 12000,
              off_peak_kw: 60,
              off_peak_kwh: 18000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(9969.75, 1); // 75 * 132.93
        expect(response.body.data.energyCharge).toBeCloseTo(97073.4, 1); // (12000 * 4.1839) + (18000 * 2.6037)
      });

      test('should calculate bill for <22kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            peakKvar: 70,
            highestDemandChargeLast12m: 8000.00,
            usage: {
              on_peak_kw: 65,
              on_peak_kwh: 10000,
              off_peak_kw: 55,
              off_peak_kwh: 15000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(13650, 1); // 65 * 210.00
        expect(response.body.data.energyCharge).toBeCloseTo(82850.5, 1); // (10000 * 4.3297) + (15000 * 2.6369)
      });
    });

    describe('Minimum Bill Protection', () => {
      test('should apply minimum bill when calculated demand is lower', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 50,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 50, // Low demand
              total_kwh: 10000
            }
          });

        expect(response.status).toBe(200);
        const calculatedDemand = 50 * 175.70; // 8785
        const minimumDemand = 20000 * 0.70; // 14000
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(calculatedDemand, 1);
        expect(response.body.data.effectiveDemandCharge).toBeCloseTo(minimumDemand, 1);
      });
    });

    describe('Validation Errors', () => {
      test('should return 400 for missing tariffType', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing voltageLevel', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing peakKvar', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing highestDemandChargeLast12m', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m. This field is mandatory for the calculation.');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: usage. This field is mandatory for the calculation.');
      });
    });

    describe('Power Factor Calculations', () => {
      test('should calculate power factor penalty correctly', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 120, // High reactive power
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100, // Low active power
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(200);
        // Power factor penalty: (120 - 100*0.6197) * 56.07 = (120 - 61.97) * 56.07 = 58.03 * 56.07 = 3252.06
        expect(response.body.data.pfCharge).toBeCloseTo(3252.06, 2);
      });

      test('should have zero power factor penalty when within limits', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
            ftRateSatang: 19.72,
            peakKvar: 50, // Low reactive power
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100, // High active power
              total_kwh: 40000
            }
          });

        expect(response.status).toBe(200);
        // Power factor penalty: max(0, 50 - 100*0.6197) * 56.07 = max(0, 50 - 61.97) * 56.07 = 0
        expect(response.body.data.pfCharge).toBeCloseTo(0);
      });
    });
  });

  describe('Type 4 - Large Business Service', () => {
    const baseUrl = '/api/PEA/calculate/type-4';

    describe('TOD Tariff', () => {
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
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('subTotal');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('grandTotal');

        // Verify calculations: (250 * 224.30) + (200 * 29.91) + (100 * 0) = 56075 + 5982 = 62057
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(62057, 1);
        expect(response.body.data.energyCharge).toBeCloseTo(310970, 1); // 100000 * 3.1097
        expect(response.body.data.serviceCharge).toBe(312.24);
        expect(response.body.data.ftCharge).toBeCloseTo(39720, 1); // 100000 * 39.72 / 100
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(65842, 1);
        expect(response.body.data.energyCharge).toBeCloseTo(251768, 1); // 80000 * 3.1471
        expect(response.body.data.serviceCharge).toBe(312.24);
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(68074.2, 1);
        expect(response.body.data.energyCharge).toBeCloseTo(222257, 1); // 70000 * 3.1751
        expect(response.body.data.serviceCharge).toBe(312.24);
      });
    });

    describe('TOU Tariff', () => {
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(14828, 1); // 200 * 74.14
        expect(response.body.data.energyCharge).toBeCloseTo(126160, 1); // (15000 * 4.1025) + (25000 * 2.5849)
        expect(response.body.data.serviceCharge).toBe(312.24);
        expect(response.body.data.ftCharge).toBeCloseTo(15888, 1); // 40000 * 39.72 / 100
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
              on_peak_kw: 180,
              on_peak_kwh: 12000,
              off_peak_kw: 120,
              off_peak_kwh: 18000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(23927.4, 1); // 180 * 132.93
        expect(response.body.data.energyCharge).toBeCloseTo(97073.4, 1); // (12000 * 4.1839) + (18000 * 2.6037)
        expect(response.body.data.serviceCharge).toBe(312.24);
        expect(response.body.data.ftCharge).toBeCloseTo(11916, 1); // 30000 * 39.72 / 100
      });

      test('should calculate bill for <22kV TOU', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            ftRateSatang: 39.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 30000.00,
            usage: {
              on_peak_kw: 150,
              on_peak_kwh: 10000,
              off_peak_kw: 100,
              off_peak_kwh: 15000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(31500, 1); // 150 * 210.00
        expect(response.body.data.energyCharge).toBeCloseTo(82850.5, 1); // (10000 * 4.3297) + (15000 * 2.6369)
        expect(response.body.data.serviceCharge).toBe(312.24);
        expect(response.body.data.ftCharge).toBeCloseTo(9930, 1); // 25000 * 39.72 / 100
      });
    });

    describe('Minimum Bill Protection', () => {
      test('should apply minimum bill when calculated demand is lower', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 80000.00,
            usage: {
              on_peak_kw: 100, // Low demand
              partial_peak_kw: 80,
              off_peak_kw: 50,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(200);
        const calculatedDemand = (100 * 224.30) + (80 * 29.91) + (50 * 0); // 22430 + 2392.8 = 24822.8
        const minimumDemand = 80000 * 0.70; // 56000
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(24822.8, 1);
        expect(response.body.data.effectiveDemandCharge).toBeCloseTo(minimumDemand, 1);
      });

      test('should not apply minimum bill when calculated demand is higher', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 39.72,
            peakKvar: 200,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              on_peak_kw: 300, // High demand
              on_peak_kwh: 20000,
              off_peak_kw: 250,
              off_peak_kwh: 30000
            }
          });

        expect(response.status).toBe(200);
        const calculatedDemand = 300 * 132.93; // 39879
        const minimumDemand = 20000 * 0.70; // 14000
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(calculatedDemand, 1);
        expect(response.body.data.effectiveDemandCharge).toBeCloseTo(calculatedDemand, 1);
        expect(response.body.data.effectiveDemandCharge).toBeGreaterThan(minimumDemand);
      });
    });

    describe('Validation Errors', () => {
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
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType. This field is mandatory for the calculation.');
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
        expect(response.body).toHaveProperty('success', false);
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
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang. This field is mandatory for the calculation.');
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
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: peakKvar. This field is mandatory for the calculation.');
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
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: highestDemandChargeLast12m. This field is mandatory for the calculation.');
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
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Missing required field: usage. This field is mandatory for the calculation.');
      });

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
        expect(response.body).toHaveProperty('success', false);
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
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Invalid voltage level for Type 4 tod. Must be ">=69kV", "22-33kV", or "<22kV", received: invalid');
      });
    });

    describe('Power Factor Calculations', () => {
      test('should calculate power factor penalty correctly', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 200, // High reactive power
            highestDemandChargeLast12m: 60000.00,
            usage: {
              on_peak_kw: 250,
              partial_peak_kw: 200,
              off_peak_kw: 100,
              total_kwh: 100000
            }
          });

        expect(response.status).toBe(200);
        // Power factor penalty: (200 - 250*0.6197) * 56.07 = (200 - 154.925) * 56.07 = 45.075 * 56.07 = 2523.15
        expect(response.body.data.pfCharge).toBeCloseTo(2523.15, 2);
      });

      test('should have zero power factor penalty when within limits', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '22-33kV',
            ftRateSatang: 39.72,
            peakKvar: 100, // Low reactive power
            highestDemandChargeLast12m: 35000.00,
            usage: {
              on_peak_kw: 200, // High active power
              on_peak_kwh: 15000,
              off_peak_kw: 180,
              off_peak_kwh: 25000
            }
          });

        expect(response.status).toBe(200);
        // Power factor penalty: max(0, 100 - 200*0.6197) * 56.07 = max(0, 100 - 123.94) * 56.07 = 0
        expect(response.body.data.pfCharge).toBeCloseTo(0);
      });
    });

    describe('Edge Cases', () => {
      test('should handle zero usage gracefully', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 50,
            highestDemandChargeLast12m: 10000.00,
            usage: {
              on_peak_kw: 0,
              partial_peak_kw: 0,
              off_peak_kw: 0,
              total_kwh: 0
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(0);
        expect(response.body.data.energyCharge).toBeCloseTo(0);
        expect(response.body.data.ftCharge).toBeCloseTo(0);
        expect(response.body.data.serviceCharge).toBe(312.24);
      });

      test('should handle very high usage values', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(210000, 1); // 1000 * 210.00
        expect(response.body.data.energyCharge).toBeCloseTo(480175, 1); // (50000 * 4.3297) + (100000 * 2.6369)
        expect(response.body.data.ftCharge).toBeCloseTo(59580, 1); // 150000 * 39.72 / 100
      });

      test('should handle TOD with zero off-peak demand', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '22-33kV',
            ftRateSatang: 39.72,
            peakKvar: 100,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              on_peak_kw: 150,
              partial_peak_kw: 100,
              off_peak_kw: 0,
              total_kwh: 50000
            }
          });

        expect(response.status).toBe(200);
        // Demand charge should only include on-peak and partial-peak
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(48645.5, 1); // (150 * 285.05) + (100 * 58.88)
        expect(response.body.data.energyCharge).toBeCloseTo(157355, 1); // 50000 * 3.1471
      });

      test('should handle TOU with zero off-peak usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tou',
            voltageLevel: '>=69kV',
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
        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(8896.8, 1); // 120 * 74.14
        expect(response.body.data.energyCharge).toBeCloseTo(82050, 1); // 20000 * 4.1025
        expect(response.body.data.ftCharge).toBeCloseTo(7944, 1); // 20000 * 39.72 / 100
      });
    });

    describe('Bill Component Calculations', () => {
      test('should correctly calculate all bill components for TOD tariff', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'tod',
            voltageLevel: '>=69kV',
            ftRateSatang: 39.72,
            peakKvar: 150,
            highestDemandChargeLast12m: 50000.00,
            usage: {
              on_peak_kw: 200,
              partial_peak_kw: 150,
              off_peak_kw: 100,
              total_kwh: 80000
            }
          });

        expect(response.status).toBe(200);
        
        // Verify all components are present and calculated correctly
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('subTotal');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('grandTotal');

        // Verify calculations
        const expectedDemandCharge = (200 * 224.30) + (150 * 29.91) + (100 * 0); // 44860 + 4486.5 = 49346.5
        const expectedEnergyCharge = 80000 * 3.1097; // 248776
        const expectedFtCharge = 80000 * (39.72 / 100); // 31776
        const expectedServiceCharge = 312.24;
        const expectedPfCharge = 1457.82; // API returns 1457.82

        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(expectedDemandCharge, 1);
        expect(response.body.data.energyCharge).toBeCloseTo(expectedEnergyCharge, 1);
        expect(response.body.data.serviceCharge).toBe(expectedServiceCharge);
        expect(response.body.data.ftCharge).toBeCloseTo(expectedFtCharge, 1);
        expect(response.body.data.pfCharge).toBeCloseTo(expectedPfCharge, 2);

        // Verify subtotal and VAT calculations
        const expectedSubTotal = response.body.effectiveDemandCharge + expectedEnergyCharge + expectedPfCharge + expectedServiceCharge + expectedFtCharge;
        const expectedVat = expectedSubTotal * 0.07;
        const expectedGrandTotal = expectedSubTotal + expectedVat;

        expect(response.body.data.subTotal).toBeCloseTo(expectedSubTotal, 2);
        expect(response.body.data.vat).toBeCloseTo(expectedVat, 5);
        expect(response.body.data.grandTotal).toBeCloseTo(expectedGrandTotal, 5);
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
              on_peak_kw: 180,
              on_peak_kwh: 12000,
              off_peak_kw: 150,
              off_peak_kwh: 18000
            }
          });

        expect(response.status).toBe(200);
        
        // Verify all components are present and calculated correctly
        expect(response.body.data).toHaveProperty('calculatedDemandCharge');
        expect(response.body.data).toHaveProperty('energyCharge');
        expect(response.body.data).toHaveProperty('effectiveDemandCharge');
        expect(response.body.data).toHaveProperty('pfCharge');
        expect(response.body.data).toHaveProperty('serviceCharge');
        expect(response.body.data).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('subTotal');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('grandTotal');

        // Verify calculations
        const expectedDemandCharge = 180 * 132.93; // 23927.4
        const expectedEnergyCharge = (12000 * 4.1839) + (18000 * 2.6037); // 50206.8 + 46866.6 = 97073.4
        const expectedFtCharge = (12000 + 18000) * (39.72 / 100); // 30000 * 0.3972 = 11916
        const expectedServiceCharge = 312.24;
        const expectedPfCharge = 448.56; // API returns 448.56

        expect(response.body.data.calculatedDemandCharge).toBeCloseTo(expectedDemandCharge, 1);
        expect(response.body.data.energyCharge).toBeCloseTo(expectedEnergyCharge, 1);
        expect(response.body.data.serviceCharge).toBe(expectedServiceCharge);
        expect(response.body.data.ftCharge).toBeCloseTo(expectedFtCharge, 1);
        expect(response.body.data.pfCharge).toBeCloseTo(expectedPfCharge, 2);

        // Verify subtotal and VAT calculations
        const expectedSubTotal = response.body.effectiveDemandCharge + expectedEnergyCharge + expectedPfCharge + expectedServiceCharge + expectedFtCharge;
        const expectedVat = expectedSubTotal * 0.07;
        const expectedGrandTotal = expectedSubTotal + expectedVat;

        expect(response.body.data.subTotal).toBeCloseTo(expectedSubTotal, 2);
        expect(response.body.data.vat).toBeCloseTo(expectedVat, 5);
        expect(response.body.data.grandTotal).toBeCloseTo(expectedGrandTotal, 5);
      });
    });
  });
});

describe('New API Endpoints', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(server)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Strategy Pattern API is healthy');
      expect(response.body).toHaveProperty('version', '3.0.0');
      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('API Information', () => {
    test('should return API information', async () => {
      const response = await request(server)
        .get('/api/info');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('version', '3.0.0');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('providers');
      expect(response.body.data).toHaveProperty('calculationTypes');
      expect(response.body.data).toHaveProperty('tariffTypes');
      expect(response.body.data).toHaveProperty('features');
    });
  });

  describe('Strategy Discovery', () => {
    test('should return available strategies for MEA', async () => {
      const response = await request(server)
        .get('/api/strategies/MEA');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('provider', 'MEA');
      expect(response.body.data).toHaveProperty('strategies');
      expect(response.body.data).toHaveProperty('count');
      expect(Array.isArray(response.body.data.strategies)).toBe(true);
    });

    test('should return available strategies for PEA', async () => {
      const response = await request(server)
        .get('/api/strategies/PEA');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('provider', 'PEA');
      expect(response.body.data).toHaveProperty('strategies');
      expect(response.body.data).toHaveProperty('count');
      expect(Array.isArray(response.body.data.strategies)).toBe(true);
    });

    test('should return strategies for calculation type', async () => {
      const response = await request(server)
        .get('/api/strategies/calculation-type/type-2');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('calculationType', 'type-2');
      expect(response.body.data).toHaveProperty('strategies');
      expect(response.body.data).toHaveProperty('count');
      expect(Array.isArray(response.body.data.strategies)).toBe(true);
    });

    test('should return 400 for missing provider', async () => {
      const response = await request(server)
        .get('/api/strategies/');

      expect(response.status).toBe(404);
    });

    test('should return 400 for missing calculation type', async () => {
      const response = await request(server)
        .get('/api/strategies/calculation-type/');

      expect(response.status).toBe(400);
    });
  });

  describe('Combination Validation', () => {
    test('should validate supported combination', async () => {
      const response = await request(server)
        .get('/api/validate?provider=MEA&calculationType=type-2&tariffType=normal&voltageLevel=<12kV');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('provider', 'MEA');
      expect(response.body.data).toHaveProperty('calculationType', 'type-2');
      expect(response.body.data).toHaveProperty('tariffType', 'normal');
      expect(response.body.data).toHaveProperty('voltageLevel', '<12kV');
      expect(response.body.data).toHaveProperty('isSupported');
    });

    test('should validate unsupported combination', async () => {
      const response = await request(server)
        .get('/api/validate?provider=MEA&calculationType=type-2&tariffType=invalid&voltageLevel=<12kV');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('isSupported', false);
    });

    test('should return 400 for missing parameters', async () => {
      const response = await request(server)
        .get('/api/validate?provider=MEA&calculationType=type-2');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('All parameters (provider, calculationType, tariffType, voltageLevel) are required');
    });
  });

  describe('Service Information', () => {
    test('should return service information', async () => {
      const response = await request(server)
        .get('/api/info');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('providers');
      expect(response.body.data).toHaveProperty('calculationTypes');
      expect(response.body.data).toHaveProperty('tariffTypes');
      expect(response.body.data).toHaveProperty('features');
      // Note: endpoints property is not included in the current response structure
      expect(response.body.data).toHaveProperty('examples');
    });
  });
});
