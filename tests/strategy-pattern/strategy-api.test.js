/**
 * Strategy Pattern API Tests (API v2 only)
 * Tests for the strategy pattern API endpoints
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Strategy Pattern API Tests (API v2)', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
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

  describe('MEA v2 Service Endpoints', () => {
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
          availableTariffTypes: expect.arrayContaining(['tou'])
        }
      });
    });

    test('GET /api/v2/mea/tariff-types/type-4 should return TOD and TOU for type-4', async () => {
      const response = await request(server)
        .get('/api/v2/mea/tariff-types/type-4')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-4',
          availableTariffTypes: expect.arrayContaining(['tod', 'tou'])
        }
      });
    });

    test('GET /api/v2/mea/rates should return rate information with query params', async () => {
      const response = await request(server)
        .get('/api/v2/mea/rates?voltageLevel=<12kV&tariffType=normal')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          provider: 'MEA',
          rateConfigurations: expect.any(Object)
        }
      });
    });

    test('GET /api/v2/mea/rates should return 200 for missing parameters', async () => {
      const response = await request(server)
        .get('/api/v2/mea/rates')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Object)
      });
    });
  });

  describe('PEA v2 Service Endpoints', () => {
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

    test('GET /api/v2/pea/rates should return PEA rate information', async () => {
      const response = await request(server)
        .get('/api/v2/pea/rates?voltageLevel=<22kV&tariffType=normal')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          provider: 'PEA',
          rateConfigurations: expect.any(Object)
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('GET /api/v2/mea/tariff-types/invalid-type should return 400', async () => {
      const response = await request(server)
        .get('/api/v2/mea/tariff-types/invalid-type')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String)
      });
    });

    test('GET /api/v2/mea/rates with invalid parameters should return 200', async () => {
      const response = await request(server)
        .get('/api/v2/mea/rates?voltageLevel=invalid&tariffType=invalid')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Object)
      });
    });
  });
});
