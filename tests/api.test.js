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
    const baseUrl = '/api/mea/calculate/type-2';

    describe('Normal Tariff', () => {
      test('should calculate bill for <12kV with 500 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 500
            }
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('energyCharge');
        expect(response.body).toHaveProperty('baseTariff');
        expect(response.body).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('totalBill');
        
        // Verify calculations
        expect(response.body.energyCharge).toBeCloseTo(1984.88, 2);
        expect(response.body.ftCharge).toBeCloseTo(98.60, 2);
      });

      test('should calculate bill for <12kV with 150 kWh (first tier only)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 150
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(487.26, 2); // 150 * 3.2484
      });

      test('should calculate bill for <12kV with 400 kWh (two tiers)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 400
            }
          });

        expect(response.status).toBe(200);
        // 150 * 3.2484 + 250 * 4.2218 = 487.26 + 1055.45 = 1542.71
        expect(response.body.energyCharge).toBeCloseTo(1542.71, 2);
      });

      test('should calculate bill for 12-24kV with 1000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '12-24kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 1000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(3908.6, 2); // 1000 * 3.9086
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
        expect(response.body).toHaveProperty('energyCharge');
        expect(response.body).toHaveProperty('baseTariff');
        expect(response.body).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('totalBill');
        
        // Verify calculations: (200 * 5.7982) + (300 * 2.6369) = 1159.64 + 791.07 = 1950.71
        expect(response.body.energyCharge).toBeCloseTo(1950.71, 2);
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
        expect(response.body.energyCharge).toBeCloseTo(1417.95, 2);
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
              total_kwh: 500
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
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 500
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
            voltageLevel: '<12kV',
            usage: {
              total_kwh: 500
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<12kV',
            ftRateSatang: 19.72
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: usage');
      });
    });
  });

  describe('Type 3 - Medium General Service', () => {
    const baseUrl = '/api/mea/calculate/type-3';

    describe('Normal Tariff', () => {
      test('should calculate bill for >=69kV', async () => {
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
        expect(response.body).toHaveProperty('calculatedDemandCharge');
        expect(response.body).toHaveProperty('energyCharge');
        expect(response.body).toHaveProperty('effectiveDemandCharge');
        expect(response.body).toHaveProperty('pfCharge');
        expect(response.body).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('subTotal');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('grandTotal');

        // Verify calculations
        expect(response.body.calculatedDemandCharge).toBeCloseTo(17570, 1); // 100 * 175.70
        expect(response.body.energyCharge).toBeCloseTo(124388, 1); // 40000 * 3.1097
        expect(response.body.pfCharge).toBeCloseTo(3252.06, 2); // (120 - 100*0.6197) * 56.07
      });

      test('should calculate bill for 12-24kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(15700.8, 1); // 80 * 196.26
        expect(response.body.energyCharge).toBeCloseTo(93813, 1); // 30000 * 3.1271
      });

      test('should calculate bill for <12kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(11075, 1); // 50 * 221.50
        expect(response.body.energyCharge).toBeCloseTo(63502, 1); // 20000 * 3.1751
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(6672.6, 1); // 90 * 74.14
        expect(response.body.energyCharge).toBeCloseTo(126160, 1); // (15000 * 4.1025) + (25000 * 2.5849)
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(9969.75, 1); // 75 * 132.93
        expect(response.body.energyCharge).toBeCloseTo(97073.4, 1); // (12000 * 4.1839) + (18000 * 2.6037)
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(13702, 1); // 65 * 210.80
        expect(response.body.energyCharge).toBeCloseTo(84850.5, 1); // (10000 * 4.5297) + (15000 * 2.6369)
      });
    });

    describe('Minimum Bill Protection', () => {
      test('should apply minimum bill when calculated demand is lower', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(calculatedDemand, 1);
        expect(response.body.effectiveDemandCharge).toBeCloseTo(minimumDemand, 1);
      });
    });
  });

  describe('Type 4 - Large General Service', () => {
    const baseUrl = '/api/mea/calculate/type-4';

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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(14828, 1); // 200 * 74.14
        expect(response.body.energyCharge).toBeCloseTo(252320, 1); // (30000 * 4.1025) + (50000 * 2.5849)
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(23927.4, 1); // 180 * 132.93
        expect(response.body.energyCharge).toBeCloseTo(208745.5, 1); // (25000 * 4.1839) + (40000 * 2.6037)
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(33728, 1); // 160 * 210.80
        expect(response.body.energyCharge).toBeCloseTo(169701, 1); // (20000 * 4.5297) + (30000 * 2.6369)
      });
    });
  });

  describe('Type 5 - Specific Business', () => {
    const baseUrl = '/api/mea/calculate/type-5';

    describe('Normal Tariff', () => {
      test('should calculate bill for >=69kV', async () => {
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
        expect(response.body).toHaveProperty('calculatedDemandCharge');
        expect(response.body).toHaveProperty('energyCharge');
        expect(response.body).toHaveProperty('effectiveDemandCharge');
        expect(response.body).toHaveProperty('pfCharge');
        expect(response.body).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('subTotal');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('grandTotal');

        expect(response.body.calculatedDemandCharge).toBeCloseTo(28646.8, 1); // 130 * 220.36
        expect(response.body.energyCharge).toBeCloseTo(155485, 1); // 50000 * 3.1097
      });

      test('should calculate bill for 12-24kV', async () => {
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(28167.7, 1); // 110 * 256.07
        expect(response.body.energyCharge).toBeCloseTo(140719.5, 1); // 45000 * 3.1271
      });

      test('should calculate bill for <12kV', async () => {
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(30430.4, 1); // 110 * 276.64
        expect(response.body.energyCharge).toBeCloseTo(142879.5, 1); // 45000 * 3.1751
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(8896.8, 1); // 120 * 74.14
        expect(response.body.energyCharge).toBeCloseTo(172521.5, 1); // (20000 * 4.1025) + (35000 * 2.5849)
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(13293, 1); // 100 * 132.93
        expect(response.body.energyCharge).toBeCloseTo(158628.6, 1); // (18000 * 4.1839) + (32000 * 2.6037)
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(18972, 1); // 90 * 210.80
        expect(response.body.energyCharge).toBeCloseTo(141778.7, 1); // (15000 * 4.5297) + (28000 * 2.6369)
      });
    });
  });

  describe('Power Factor Calculations', () => {
    test('should calculate power factor penalty correctly', async () => {
      const response = await request(server)
        .post('/api/mea/calculate/type-3')
        .send({
          tariffType: 'normal',
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
      expect(response.body.pfCharge).toBeCloseTo(3252.06, 2);
    });

    test('should have zero power factor penalty when within limits', async () => {
      const response = await request(server)
        .post('/api/mea/calculate/type-3')
        .send({
          tariffType: 'normal',
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
      expect(response.body.pfCharge).toBeCloseTo(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero usage gracefully', async () => {
      const response = await request(server)
        .post('/api/mea/calculate/type-2')
        .send({
          tariffType: 'normal',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 0
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.energyCharge).toBeCloseTo(0);
      expect(response.body.ftCharge).toBeCloseTo(0);
      expect(response.body.vat).toBeCloseTo(2.33, 2); // Only service charge * VAT rate
    });

    test('should handle very high usage values', async () => {
      const response = await request(server)
        .post('/api/mea/calculate/type-2')
        .send({
          tariffType: 'normal',
          voltageLevel: '<12kV',
          ftRateSatang: 19.72,
          usage: {
            total_kwh: 1000000
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.energyCharge).toBeGreaterThan(0);
      expect(response.body.totalBill).toBeGreaterThan(0);
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
    const baseUrl = '/api/pea/calculate/type-2';

    describe('Normal Tariff', () => {
      test('should calculate bill for <22kV with 500 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 500
            }
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('energyCharge');
        expect(response.body).toHaveProperty('serviceCharge');
        expect(response.body).toHaveProperty('baseTariff');
        expect(response.body).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('totalBill');
        
        // Verify calculations: 150*3.2484 + 250*4.2218 + 100*4.4217 = 487.26 + 1055.45 + 442.17 = 1984.88
        expect(response.body.energyCharge).toBeCloseTo(1984.88, 2);
        expect(response.body.serviceCharge).toBe(33.29);
        expect(response.body.ftCharge).toBeCloseTo(98.60, 2); // 500 * 19.72 / 100
      });

      test('should calculate bill for <22kV with 150 kWh (first tier only)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 150
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(487.26, 2); // 150 * 3.2484
        expect(response.body.serviceCharge).toBe(33.29);
      });

      test('should calculate bill for <22kV with 400 kWh (two tiers)', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 400
            }
          });

        expect(response.status).toBe(200);
        // 150 * 3.2484 + 250 * 4.2218 = 487.26 + 1055.45 = 1542.71
        expect(response.body.energyCharge).toBeCloseTo(1542.71, 2);
      });

      test('should calculate bill for 22-33kV with 1000 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 1000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(3908.6, 2); // 1000 * 3.9086
        expect(response.body.serviceCharge).toBe(312.24);
      });

      test('should calculate bill for 22-33kV with 500 kWh', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 500
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(1954.3, 2); // 500 * 3.9086
        expect(response.body.serviceCharge).toBe(312.24);
        expect(response.body.ftCharge).toBeCloseTo(98.60, 2); // 500 * 19.72 / 100
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
        expect(response.body).toHaveProperty('energyCharge');
        expect(response.body).toHaveProperty('serviceCharge');
        expect(response.body).toHaveProperty('baseTariff');
        expect(response.body).toHaveProperty('ftCharge');
        expect(response.body).toHaveProperty('vat');
        expect(response.body).toHaveProperty('totalBill');
        
        // Verify calculations: (200 * 5.7982) + (300 * 2.6369) = 1159.64 + 791.07 = 1950.71
        expect(response.body.energyCharge).toBeCloseTo(1950.71, 2);
        expect(response.body.serviceCharge).toBe(33.29);
        expect(response.body.ftCharge).toBeCloseTo(98.60, 2); // 500 * 19.72 / 100
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
        expect(response.body.energyCharge).toBeCloseTo(1417.95, 2);
        expect(response.body.serviceCharge).toBe(312.24);
        expect(response.body.ftCharge).toBeCloseTo(78.88, 2); // 400 * 19.72 / 100
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
        expect(response.body.energyCharge).toBeCloseTo(2108.775, 2);
        expect(response.body.ftCharge).toBeCloseTo(98.60, 2); // 500 * 19.72 / 100
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
              total_kwh: 500
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
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 500
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
            usage: {
              total_kwh: 500
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: ftRateSatang');
      });

      test('should return 400 for missing usage', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72
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
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 500
            }
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Invalid tariff type');
      });

      test('should return 400 for missing request body', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send();

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Request body is required');
      });
    });

    describe('Edge Cases', () => {
      test('should handle zero usage gracefully', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 0
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(0);
        expect(response.body.ftCharge).toBeCloseTo(0);
        expect(response.body.serviceCharge).toBe(33.29);
        expect(response.body.vat).toBeCloseTo(2.33, 2); // Only service charge * VAT rate (33.29 * 0.07)
      });

      test('should handle very high usage values for <22kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 1000000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeGreaterThan(0);
        expect(response.body.totalBill).toBeGreaterThan(0);
        // For very high usage, most will be at the highest tier (4.4217)
        const expectedEnergyCharge = 150 * 3.2484 + 250 * 4.2218 + (1000000 - 400) * 4.4217;
        expect(response.body.energyCharge).toBeCloseTo(expectedEnergyCharge, 2);
      });

      test('should handle very high usage values for 22-33kV', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '22-33kV',
            ftRateSatang: 19.72,
            usage: {
              total_kwh: 1000000
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.energyCharge).toBeCloseTo(3908600, 1); // 1000000 * 3.9086
        expect(response.body.totalBill).toBeGreaterThan(0);
      });

      test('should handle zero FT rate', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            ftRateSatang: 0,
            usage: {
              total_kwh: 500
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.ftCharge).toBeCloseTo(0);
        expect(response.body.energyCharge).toBeCloseTo(1984.88, 2);
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
        expect(response.body.energyCharge).toBeCloseTo(1054.76, 2); // 400 * 2.6369
        expect(response.body.ftCharge).toBeCloseTo(78.88, 2); // 400 * 19.72 / 100
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
        expect(response.body.energyCharge).toBeCloseTo(1739.46, 2); // 300 * 5.7982
        expect(response.body.ftCharge).toBeCloseTo(59.16, 2); // 300 * 19.72 / 100
      });
    });

    describe('Bill Component Calculations', () => {
      test('should correctly calculate all bill components for normal tariff', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
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
        
        expect(response.body.energyCharge).toBeCloseTo(energyCharge, 2);
        expect(response.body.serviceCharge).toBe(serviceCharge);
        expect(response.body.baseTariff).toBeCloseTo(baseTariff, 2);
        expect(response.body.ftCharge).toBeCloseTo(ftCharge, 2);
        expect(response.body.vat).toBeCloseTo(vat, 2);
        expect(response.body.totalBill).toBeCloseTo(totalBill, 2);
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
        
        expect(response.body.energyCharge).toBeCloseTo(energyCharge, 2);
        expect(response.body.serviceCharge).toBe(serviceCharge);
        expect(response.body.baseTariff).toBeCloseTo(baseTariff, 2);
        expect(response.body.ftCharge).toBeCloseTo(ftCharge, 2);
        expect(response.body.vat).toBeCloseTo(vat, 2);
        expect(response.body.totalBill).toBeCloseTo(totalBill, 2);
      });
    });
  });

  describe('Type 3 - Medium Business Service', () => {
    const baseUrl = '/api/pea/calculate/type-3';

    describe('Normal Tariff', () => {
      test('should calculate bill for >=69kV', async () => {
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(17570, 1); // 100 * 175.70
        expect(response.body.energyCharge).toBeCloseTo(124388, 1); // 40000 * 3.1097
        expect(response.body.pfCharge).toBeCloseTo(3252.06, 2); // (120 - 100*0.6197) * 56.07
      });

      test('should calculate bill for 22-33kV', async () => {
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(15700.8, 1); // 80 * 196.26
        expect(response.body.energyCharge).toBeCloseTo(94413, 1); // 30000 * 3.1471
      });

      test('should calculate bill for <22kV', async () => {
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(11075, 1); // 50 * 221.50
        expect(response.body.energyCharge).toBeCloseTo(63502, 1); // 20000 * 3.1751
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(6672.6, 1); // 90 * 74.14
        expect(response.body.energyCharge).toBeCloseTo(126160, 1); // (15000 * 4.1025) + (25000 * 2.5849)
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(9969.75, 1); // 75 * 132.93
        expect(response.body.energyCharge).toBeCloseTo(97273.4, 1); // (12000 * 4.1839) + (18000 * 2.6037)
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(13650, 1); // 65 * 210.00
        expect(response.body.energyCharge).toBeCloseTo(84850.5, 1); // (10000 * 4.3297) + (15000 * 2.6369)
      });
    });

    describe('Minimum Bill Protection', () => {
      test('should apply minimum bill when calculated demand is lower', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
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
        expect(response.body.calculatedDemandCharge).toBeCloseTo(calculatedDemand, 1);
        expect(response.body.effectiveDemandCharge).toBeCloseTo(minimumDemand, 1);
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
        expect(response.body).toHaveProperty('error', 'Missing required field: tariffType');
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
        expect(response.body).toHaveProperty('error', 'Missing required field: voltageLevel');
      });

      test('should return 400 for missing ftRateSatang', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
            voltageLevel: '<22kV',
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            ftRateSatang: 19.72,
            highestDemandChargeLast12m: 20000.00,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            ftRateSatang: 19.72,
            peakKvar: 120,
            usage: {
              peak_kw: 100,
              total_kwh: 40000
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
            ftRateSatang: 19.72,
            peakKvar: 120,
            highestDemandChargeLast12m: 20000.00
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required field: usage');
      });
    });

    describe('Power Factor Calculations', () => {
      test('should calculate power factor penalty correctly', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
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
        expect(response.body.pfCharge).toBeCloseTo(3252.06, 2);
      });

      test('should have zero power factor penalty when within limits', async () => {
        const response = await request(server)
          .post(baseUrl)
          .send({
            tariffType: 'normal',
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
        expect(response.body.pfCharge).toBeCloseTo(0);
      });
    });
  });
});
