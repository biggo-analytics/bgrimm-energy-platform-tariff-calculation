/**
 * New API Tests for Strategy Pattern
 * Tests for the updated API endpoints that use the new strategy pattern
 */

const request = require('supertest');
const app = require('../src/app');

describe('New Strategy Pattern API Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    test('GET /health should return status ok', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String)
      });
    });
  });

  describe('API v1 with Strategy Pattern', () => {
    describe('MEA Calculations', () => {
      test('POST /api/mea/calculate/type-2 should calculate TOU bill', async () => {
        const response = await request(server)
          .post('/api/mea/calculate/type-2')
          .send({
            tariffType: 'tou',
            voltageLevel: '<12kV',
            onPeakKwh: 300,
            offPeakKwh: 700
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-2',
            tariffType: 'tou',
            voltageLevel: '<12kV',
            totalAmount: expect.any(Number),
            strategyUsed: expect.stringContaining('MEA_2.2')
          },
          timestamp: expect.any(String)
        });

        expect(response.body.data.totalAmount).toBeCloseTo(3618.58, 2);
      });

      test('POST /api/mea/calculate/type-3 should calculate normal bill', async () => {
        const response = await request(server)
          .post('/api/mea/calculate/type-3')
          .send({
            tariffType: 'normal',
            voltageLevel: '<12kV',
            kwh: 1500,
            demand: 75
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-3',
            tariffType: 'normal',
            voltageLevel: '<12kV',
            totalAmount: expect.any(Number),
            strategyUsed: 'MEA_3.1.3_medium_normal'
          }
        });

        expect(response.body.data.totalAmount).toBeCloseTo(21687.39, 2);
      });

      test('POST /api/mea/calculate/type-4 should calculate TOD bill', async () => {
        const response = await request(server)
          .post('/api/mea/calculate/type-4')
          .send({
            tariffType: 'tod',
            voltageLevel: '<12kV',
            kwh: 2000,
            onPeakDemand: 120,
            partialPeakDemand: 80,
            offPeakDemand: 40
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-4',
            tariffType: 'tod',
            voltageLevel: '<12kV',
            totalAmount: expect.any(Number),
            strategyUsed: 'MEA_4.1.3_large_TOD'
          }
        });

        expect(response.body.data.totalAmount).toBeCloseTo(65851.64, 2);
      });

      test('should return error for missing parameters', async () => {
        const response = await request(server)
          .post('/api/mea/calculate/type-3')
          .send({
            tariffType: 'normal'
            // Missing voltageLevel
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Missing required parameters: tariffType, voltageLevel',
          timestamp: expect.any(String)
        });
      });

      test('should return error for invalid voltage level', async () => {
        const response = await request(server)
          .post('/api/mea/calculate/type-3')
          .send({
            tariffType: 'normal',
            voltageLevel: 'invalid',
            kwh: 1000,
            demand: 50
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: expect.stringContaining('Invalid voltage level')
        });
      });
    });

    describe('PEA Calculations', () => {
      test('POST /api/pea/calculate/type-2 should calculate TOU bill', async () => {
        const response = await request(server)
          .post('/api/pea/calculate/type-2')
          .send({
            tariffType: 'tou',
            voltageLevel: '<22kV',
            onPeakKwh: 300,
            offPeakKwh: 700
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-2',
            tariffType: 'tou',
            voltageLevel: '<22kV',
            totalAmount: expect.any(Number),
            strategyUsed: expect.stringContaining('PEA_2.2')
          }
        });

        expect(response.body.data.totalAmount).toBeCloseTo(3618.58, 2);
      });

      test('POST /api/pea/calculate/type-3 should calculate normal bill', async () => {
        const response = await request(server)
          .post('/api/pea/calculate/type-3')
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            kwh: 1500,
            demand: 75
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-3',
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            totalAmount: expect.any(Number),
            strategyUsed: 'PEA_3.1.1_medium_normal'
          }
        });

        expect(response.body.data.totalAmount).toBeCloseTo(18154.29, 2);
      });

      test('POST /api/pea/calculate/type-4 should calculate TOD bill', async () => {
        const response = await request(server)
          .post('/api/pea/calculate/type-4')
          .send({
            tariffType: 'tod',
            voltageLevel: '22-33kV',
            kwh: 2000,
            onPeakDemand: 120,
            partialPeakDemand: 80,
            offPeakDemand: 40
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-4',
            tariffType: 'tod',
            voltageLevel: '22-33kV',
            totalAmount: expect.any(Number),
            strategyUsed: 'PEA_4.1.2_large_TOD'
          }
        });

        expect(response.body.data.totalAmount).toBeCloseTo(45522.84, 2);
      });

      test('should return error for invalid voltage level (PEA)', async () => {
        const response = await request(server)
          .post('/api/pea/calculate/type-3')
          .send({
            tariffType: 'normal',
            voltageLevel: '<12kV', // Invalid for PEA
            kwh: 1000,
            demand: 50
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: expect.stringContaining('Invalid voltage level')
        });
      });
    });
  });

  describe('API v2 with Enhanced Strategy Pattern', () => {
    describe('MEA Information Endpoints', () => {
      test('GET /api/v2/mea/info should return service information', async () => {
        const response = await request(server)
          .get('/api/v2/mea/info')
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            provider: 'MEA',
            description: 'Metropolitan Electricity Authority',
            availableStrategies: expect.any(Number),
            strategies: expect.any(Array),
            voltageOptions: ['<12kV', '12-24kV', '>=69kV'],
            tariffTypes: ['normal', 'tou', 'tod'],
            calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5']
          }
        });

        expect(response.body.data.availableStrategies).toBeGreaterThan(0);
        expect(response.body.data.strategies.length).toBeGreaterThan(0);
      });

      test('GET /api/v2/mea/rates should return rate configurations', async () => {
        const response = await request(server)
          .get('/api/v2/mea/rates')
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            provider: 'MEA',
            rateConfigurations: expect.any(Object)
          }
        });

        // Check that rate configurations contain expected strategy names
        const configs = response.body.data.rateConfigurations;
        expect(configs).toHaveProperty('MEA_2.2.1_small_TOU');
        expect(configs).toHaveProperty('MEA_3.1.3_medium_normal');
      });

      test('GET /api/v2/mea/tariff-types/type-3 should return available tariff types', async () => {
        const response = await request(server)
          .get('/api/v2/mea/tariff-types/type-3')
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-3',
            availableTariffTypes: ['normal', 'tou']
          }
        });
      });

      test('GET /api/v2/mea/tariff-types/invalid should return error', async () => {
        const response = await request(server)
          .get('/api/v2/mea/tariff-types/invalid')
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: expect.stringContaining('Invalid calculation type')
        });
      });
    });

    describe('PEA Information Endpoints', () => {
      test('GET /api/v2/pea/info should return service information', async () => {
        const response = await request(server)
          .get('/api/v2/pea/info')
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            provider: 'PEA',
            description: 'Provincial Electricity Authority',
            availableStrategies: expect.any(Number),
            strategies: expect.any(Array),
            voltageOptions: ['<22kV', '22-33kV', '>=69kV'],
            tariffTypes: ['normal', 'tou', 'tod'],
            calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5']
          }
        });
      });

      test('GET /api/v2/pea/rates should return rate configurations', async () => {
        const response = await request(server)
          .get('/api/v2/pea/rates')
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            provider: 'PEA',
            rateConfigurations: expect.any(Object)
          }
        });

        // Check that rate configurations contain expected strategy names
        const configs = response.body.data.rateConfigurations;
        expect(configs).toHaveProperty('PEA_2.2.1_small_TOU');
        expect(configs).toHaveProperty('PEA_3.1.3_medium_normal');
      });
    });

    describe('API v2 General Endpoints', () => {
      test('GET /api/v2/health should return enhanced health status', async () => {
        const response = await request(server)
          .get('/api/v2/health')
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          message: 'Strategy Pattern API is healthy',
          version: '2.0.0',
          features: expect.arrayContaining([
            'Strategy Pattern Implementation',
            'Enhanced Error Handling'
          ])
        });
      });

      test('GET /api/v2/info should return comprehensive API information', async () => {
        const response = await request(server)
          .get('/api/v2/info')
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            version: '2.0.0',
            description: 'Enhanced Electricity Tariff Calculation API with Strategy Pattern',
            providers: ['MEA', 'PEA'],
            calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5'],
            tariffTypes: ['normal', 'tou', 'tod'],
            features: {
              strategyPattern: true,
              enhancedValidation: true,
              serviceDiscovery: true,
              rateInformation: true,
              errorHandling: 'Enhanced'
            }
          }
        });
      });
    });

    describe('MEA v2 Calculations', () => {
      test('POST /api/v2/mea/calculate/type-3 should calculate using strategy pattern', async () => {
        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send({
            tariffType: 'normal',
            voltageLevel: '<12kV',
            kwh: 1500,
            demand: 75
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-3',
            tariffType: 'normal',
            voltageLevel: '<12kV',
            totalAmount: expect.any(Number),
            strategyUsed: 'MEA_3.1.3_medium_normal'
          }
        });

        expect(response.body.data.totalAmount).toBeCloseTo(21687.39, 2);
      });
    });

    describe('PEA v2 Calculations', () => {
      test('POST /api/v2/pea/calculate/type-3 should calculate using strategy pattern', async () => {
        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send({
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            kwh: 1500,
            demand: 75
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            calculationType: 'type-3',
            tariffType: 'normal',
            voltageLevel: '>=69kV',
            totalAmount: expect.any(Number),
            strategyUsed: 'PEA_3.1.1_medium_normal'
          }
        });

        expect(response.body.data.totalAmount).toBeCloseTo(18154.29, 2);
      });
    });
  });

  describe('Cross-Version Compatibility', () => {
    test('v1 and v2 should return same calculation results', async () => {
      const testData = {
        tariffType: 'normal',
        voltageLevel: '<12kV',
        kwh: 1000,
        demand: 50
      };

      const v1Response = await request(server)
        .post('/api/mea/calculate/type-3')
        .send(testData)
        .expect(200);

      const v2Response = await request(server)
        .post('/api/v2/mea/calculate/type-3')
        .send(testData)
        .expect(200);

      expect(v1Response.body.data.totalAmount).toBeCloseTo(v2Response.body.data.totalAmount, 2);
    });
  });
});
