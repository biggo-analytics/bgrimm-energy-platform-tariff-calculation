/**
 * Strategy Pattern API Tests
 * Comprehensive tests for the new strategy-based API endpoints
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Strategy Pattern API Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });
  
  describe('API Information Endpoints', () => {
    test('GET /api/v2/health should return health status', async () => {
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

    test('GET /api/v2/info should return API information', async () => {
      const response = await request(server)
        .get('/api/v2/info')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          version: '2.0.0',
          providers: ['MEA', 'PEA'],
          calculationTypes: ['type-2', 'type-3', 'type-4', 'type-5'],
          tariffTypes: ['normal', 'tou', 'tod']
        }
      });
    });

    test('GET /api/v2/compare should return version comparison', async () => {
      const response = await request(server)
        .get('/api/v2/compare')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          v1: expect.objectContaining({ endpoint: '/api' }),
          v2: expect.objectContaining({ endpoint: '/api/v2' }),
          migration: expect.objectContaining({ status: 'Available' })
        }
      });
    });
  });

  describe('MEA Service Information', () => {
    test('GET /api/v2/mea/info should return MEA service information', async () => {
      const response = await request(server)
        .get('/api/v2/mea/info')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          provider: 'MEA',
          providerName: 'Metropolitan Electricity Authority',
          validVoltageLevels: ['<12kV', '12-24kV', '>=69kV'],
          serviceCharge: 312.24
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
          availableTariffTypes: ['normal', 'tou']
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
          availableTariffTypes: ['tod', 'tou']
        }
      });
    });

    test('GET /api/v2/mea/rates should return rate information with query params', async () => {
      const response = await request(server)
        .get('/api/v2/mea/rates')
        .query({
          calculationType: 'type-2',
          tariffType: 'normal',
          voltageLevel: '<12kV'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          provider: 'MEA',
          calculationType: 'type-2',
          tariffType: 'normal',
          voltageLevel: '<12kV',
          rates: expect.objectContaining({
            serviceCharge: expect.any(Number),
            energyRates: expect.any(Array)
          })
        }
      });
    });

    test('GET /api/v2/mea/rates should return 400 for missing parameters', async () => {
      const response = await request(server)
        .get('/api/v2/mea/rates')
        .query({
          calculationType: 'type-2'
          // Missing tariffType and voltageLevel
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Missing required parameters: calculationType, tariffType, voltageLevel'
      });
    });
  });

  describe('PEA Service Information', () => {
    test('GET /api/v2/pea/info should return PEA service information', async () => {
      const response = await request(server)
        .get('/api/v2/pea/info')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          provider: 'PEA',
          providerName: 'Provincial Electricity Authority',
          validVoltageLevels: ['<22kV', '22-33kV', '>=69kV'],
          serviceCharge: 'Variable by rate configuration'
        }
      });
    });

    test('GET /api/v2/pea/rates should return PEA rate information', async () => {
      const response = await request(server)
        .get('/api/v2/pea/rates')
        .query({
          calculationType: 'type-3',
          tariffType: 'normal',
          voltageLevel: '>=69kV'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          provider: 'PEA',
          calculationType: 'type-3',
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          rates: expect.objectContaining({
            demand: expect.any(Number),
            energy: expect.any(Number),
            serviceCharge: expect.any(Number)
          })
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('GET /api/v2/mea/tariff-types/invalid-type should return empty array', async () => {
      const response = await request(server)
        .get('/api/v2/mea/tariff-types/invalid-type')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'invalid-type',
          availableTariffTypes: []
        }
      });
    });

    test('GET /api/v2/mea/rates with invalid parameters should return error', async () => {
      const response = await request(server)
        .get('/api/v2/mea/rates')
        .query({
          calculationType: 'invalid',
          tariffType: 'invalid',
          voltageLevel: 'invalid'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String)
      });
    });
  });
});
