/**
 * API Integration and Strategy Pattern Test Suite
 * Tests for API endpoints, strategy selection, and integration flows
 */

const request = require('supertest');
const app = require('../../src/app');

describe('API Integration and Strategy Pattern Test Suite', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('API v2 Core Endpoints', () => {
    test('GET /api/v2/health should return health status', async () => {
      const response = await request(server)
        .get('/api/v2/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Strategy Pattern API is healthy',
        version: '2.0.0',
        features: expect.any(Array),
        timestamp: expect.any(String)
      });
    });

    test('GET /api/v2/info should return API information', async () => {
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

    test('GET /api/v2/compare should return version comparison', async () => {
      const response = await request(server)
        .get('/api/v2/compare')
        .expect(200);

      expect(response.body.data).toMatchObject({
        v2: expect.objectContaining({ endpoint: '/api/v2' }),
        migration: expect.objectContaining({ status: 'Available' })
      });
    });
  });

  describe('MEA Service Endpoints', () => {
    test('GET /api/v2/mea/info should return MEA service information', async () => {
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
    });

    test('GET /api/v2/mea/tariff-types/type-2 should return available tariff types', async () => {
      const response = await request(server)
        .get('/api/v2/mea/tariff-types/type-2')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-2',
          availableTariffTypes: expect.arrayContaining(['tou']),
          voltageLevels: expect.arrayContaining(['<12kV', '12-24kV']),
          strategies: expect.arrayContaining([
            'MEA_2.2.1_small_TOU',
            'MEA_2.2.2_small_TOU'
          ])
        }
      });
    });

    test('GET /api/v2/mea/strategies should return all available strategies', async () => {
      const response = await request(server)
        .get('/api/v2/mea/strategies')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          provider: 'MEA',
          strategies: expect.arrayContaining([
            'MEA_2.2.1_small_TOU',
            'MEA_2.2.2_small_TOU',
            'MEA_3.1.1_medium_normal',
            'MEA_3.2.1_medium_TOU',
            'MEA_4.1.1_large_TOD',
            'MEA_5.1.1_specific_normal'
          ]),
          count: expect.any(Number),
        }
      });
    });
  });

  describe('PEA Service Endpoints', () => {
    test('GET /api/v2/pea/info should return PEA service information', async () => {
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

    test('GET /api/v2/pea/tariff-types/type-2 should return available tariff types', async () => {
      const response = await request(server)
        .get('/api/v2/pea/tariff-types/type-2')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-2',
          availableTariffTypes: expect.arrayContaining(['tou']),
          voltageLevels: expect.arrayContaining(['<22kV', '22-33kV', '>=69kV']),
          strategies: expect.arrayContaining([
            'PEA_2.2.1_small_TOU',
            'PEA_2.2.2_small_TOU'
          ])
        }
      });
    });

    test('GET /api/v2/pea/strategies should return all available strategies', async () => {
      const response = await request(server)
        .get('/api/v2/pea/strategies')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          provider: 'PEA',
          strategies: expect.arrayContaining([
            'PEA_2.2.1_small_TOU',
            'PEA_2.2.2_small_TOU',
            'PEA_3.1.1_medium_normal',
            'PEA_3.2.1_medium_TOU',
            'PEA_4.1.1_large_TOD',
            'PEA_5.1.1_specific_TOU'
          ]),
          count: expect.any(Number),
        }
      });
    });
  });

  describe('Strategy Selection and Factory Tests', () => {
    describe('MEA Strategy Selection', () => {
      test('should select correct strategy for MEA type-2 TOU <12kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_2.2.1_small_TOU');
        expect(response.body.data.calculationType).toBe('type-2');
        expect(response.body.data.tariffType).toBe('tou');
        expect(response.body.data.voltageLevel).toBe('<12kV');
      });

      test('should select correct strategy for MEA type-3 normal <12kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1500,
          demand: 75
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_3.1.3_medium_normal');
        expect(response.body.data.calculationType).toBe('type-3');
        expect(response.body.data.tariffType).toBe('normal');
        expect(response.body.data.voltageLevel).toBe('<12kV');
      });

      test('should select correct strategy for MEA type-4 TOD <12kV', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '<12kV',
          kwh: 5000,
          onPeakDemand: 200,
          partialPeakDemand: 150,
          offPeakDemand: 100
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_4.1.1_large_TOD');
        expect(response.body.data.calculationType).toBe('type-4');
        expect(response.body.data.tariffType).toBe('tod');
        expect(response.body.data.voltageLevel).toBe('<12kV');
      });
    });

    describe('PEA Strategy Selection', () => {
      test('should select correct strategy for PEA type-2 TOU <22kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_2.2.1_small_TOU');
        expect(response.body.data.calculationType).toBe('type-2');
        expect(response.body.data.tariffType).toBe('tou');
        expect(response.body.data.voltageLevel).toBe('<22kV');
      });

      test('should select correct strategy for PEA type-3 normal <22kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<22kV',
          kwh: 1500,
          demand: 75
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_3.1.1_medium_normal');
        expect(response.body.data.calculationType).toBe('type-3');
        expect(response.body.data.tariffType).toBe('normal');
        expect(response.body.data.voltageLevel).toBe('<22kV');
      });

      test('should select correct strategy for PEA type-4 TOD <22kV', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '<22kV',
          kwh: 5000,
          onPeakDemand: 200,
          partialPeakDemand: 150,
          offPeakDemand: 100
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_4.1.1_large_TOD');
        expect(response.body.data.calculationType).toBe('type-4');
        expect(response.body.data.tariffType).toBe('tod');
        expect(response.body.data.voltageLevel).toBe('<22kV');
      });
    });
  });

  describe('Calculation Accuracy Tests', () => {
    describe('MEA Calculation Accuracy', () => {
      test('should calculate MEA type-2 TOU correctly', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(200);

        // Verify the calculation result is reasonable
        expect(response.body.data.totalAmount).toBeGreaterThan(0);
        expect(response.body.data.totalAmount).toBeLessThan(10000);
        
        // Verify breakdown components
        expect(response.body.data.breakdown).toBeDefined();
        expect(response.body.data.breakdown.energyCharge).toBeGreaterThan(0);
        expect(response.body.data.breakdown.serviceCharge).toBeGreaterThan(0);
        expect(response.body.data.breakdown.totalAmount).toBe(response.body.data.totalAmount);
      });

      test('should calculate MEA type-3 normal correctly', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1500,
          demand: 75
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeGreaterThan(0);
        expect(response.body.data.totalAmount).toBeLessThan(10000);
        
        expect(response.body.data.breakdown).toBeDefined();
        expect(response.body.data.breakdown.energyCharge).toBeGreaterThan(0);
        expect(response.body.data.breakdown.demandCharge).toBeGreaterThan(0);
        expect(response.body.data.breakdown.serviceCharge).toBeGreaterThan(0);
      });
    });

    describe('PEA Calculation Accuracy', () => {
      test('should calculate PEA type-2 TOU correctly', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeGreaterThan(0);
        expect(response.body.data.totalAmount).toBeLessThan(10000);
        
        expect(response.body.data.breakdown).toBeDefined();
        expect(response.body.data.breakdown.energyCharge).toBeGreaterThan(0);
        expect(response.body.data.breakdown.serviceCharge).toBeGreaterThan(0);
      });

      test('should calculate PEA type-3 normal correctly', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<22kV',
          kwh: 1500,
          demand: 75
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeGreaterThan(0);
        expect(response.body.data.totalAmount).toBeLessThan(10000);
        
        expect(response.body.data.breakdown).toBeDefined();
        expect(response.body.data.breakdown.energyCharge).toBeGreaterThan(0);
        expect(response.body.data.breakdown.demandCharge).toBeGreaterThan(0);
        expect(response.body.data.breakdown.serviceCharge).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance and Load Tests', () => {
    test('should handle multiple concurrent requests efficiently', async () => {
      const requestData = {
        tariffType: 'tou',
        voltageLevel: '<12kV',
        onPeakKwh: 300,
        offPeakKwh: 700
      };

      const startTime = Date.now();
      
      // Send 10 concurrent requests
      const promises = Array(10).fill().map(() =>
        request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(200)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.strategyUsed).toBe('MEA_2.2.1_small_TOU');
      });

      // Performance check: 10 requests should complete within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds
      console.log(`10 concurrent requests completed in ${totalTime}ms`);
    });

    test('should maintain consistent response times', async () => {
      const requestData = {
        tariffType: 'normal',
        voltageLevel: '<12kV',
        kwh: 1000,
        demand: 50
      };

      const responseTimes = [];

      // Send 5 sequential requests to measure consistency
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);
        
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);

        expect(response.body.success).toBe(true);
      }

      // Check that response times are consistent (within reasonable variance)
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / responseTimes.length;
      const stdDev = Math.sqrt(variance);

      console.log(`Average response time: ${avgTime}ms, Std Dev: ${stdDev}ms`);
      expect(stdDev).toBeLessThan(avgTime * 0.5); // Variance should be less than 50% of average
    });
  });

  describe('Error Recovery and Resilience Tests', () => {
    test('should recover from malformed requests gracefully', async () => {
      // Send a malformed request
      const malformedData = {
        tariffType: 'tou',
        voltageLevel: '<12kV',
        onPeakKwh: 'invalid',
        offPeakKwh: 700
      };

      const response1 = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(malformedData)
        .expect(400);

      expect(response1.body.success).toBe(false);

      // Send a valid request immediately after
      const validData = {
        tariffType: 'tou',
        voltageLevel: '<12kV',
        onPeakKwh: 300,
        offPeakKwh: 700
      };

      const response2 = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(validData)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data.strategyUsed).toBe('MEA_2.2.1_small_TOU');
    });

    test('should handle rapid request sequences without errors', async () => {
      const requestData = {
        tariffType: 'tou',
        voltageLevel: '<12kV',
        onPeakKwh: 300,
        offPeakKwh: 700
      };

      // Send rapid sequence of requests
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(server)
            .post('/api/v2/mea/calculate/type-2')
            .send(requestData)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach((response, index) => {
        expect(response.body.success).toBe(true, `Request ${index + 1} failed`);
        expect(response.body.data.strategyUsed).toBe('MEA_2.2.1_small_TOU');
      });
    });
  });
});
