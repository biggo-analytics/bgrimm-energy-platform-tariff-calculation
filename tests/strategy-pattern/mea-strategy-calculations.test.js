/**
 * MEA Strategy Pattern Calculation Tests
 * Tests for MEA calculations using the strategy pattern (API v2 only)
 */

const request = require('supertest');
const app = require('../../src/app');

describe('MEA Strategy Pattern Calculations (API v2)', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });
  
  describe('MEA Type 2 Calculations', () => {
    test('POST /api/v2/mea/calculate/type-2 - TOU tariff <12kV', async () => {
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

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-2',
          tariffType: 'tou',
          voltageLevel: '<12kV',
          totalAmount: expect.any(Number),
          strategyUsed: expect.stringContaining('MEA_2.2.1_small_TOU')
        }
      });

      // Verify TOU calculation
      expect(response.body.data.totalAmount).toBeCloseTo(3618.58, 2);
    });

    test('POST /api/v2/mea/calculate/type-2 - TOU tariff 12-24kV', async () => {
      const requestData = {
        tariffType: 'tou',
        voltageLevel: '12-24kV',
        onPeakKwh: 300,
        offPeakKwh: 700
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-2',
          tariffType: 'tou',
          voltageLevel: '12-24kV',
          totalAmount: expect.any(Number),
          strategyUsed: expect.stringContaining('MEA_2.2.2_small_TOU')
        }
      });
    });
  });

  describe('MEA Type 3 Calculations', () => {
    test('POST /api/v2/mea/calculate/type-3 - Normal tariff <12kV', async () => {
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

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-3',
          tariffType: 'normal',
          voltageLevel: '<12kV',
          totalAmount: expect.any(Number),
          strategyUsed: expect.stringContaining('MEA_3.1.3_medium_normal')
        }
      });
    });

    test('POST /api/v2/mea/calculate/type-3 - TOU tariff >=69kV', async () => {
      const requestData = {
        tariffType: 'tou',
        voltageLevel: '>=69kV',
        onPeakKwh: 800,
        offPeakKwh: 1200,
        demand: 100
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-3')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-3',
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          totalAmount: expect.any(Number),
          strategyUsed: expect.stringContaining('MEA_3.2.1_medium_TOU')
        }
      });
    });
  });

  describe('MEA Type 4 Calculations', () => {
    test('POST /api/v2/mea/calculate/type-4 - TOD tariff <12kV', async () => {
      const requestData = {
        tariffType: 'tod',
        voltageLevel: '<12kV',
        kwh: 2000,
        onPeakDemand: 120,
        partialPeakDemand: 80,
        offPeakDemand: 40
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-4')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-4',
          tariffType: 'tod',
          voltageLevel: '<12kV',
          totalAmount: expect.any(Number),
          strategyUsed: expect.stringContaining('MEA_4.1.3_large_TOD')
        }
      });
    });

    test('POST /api/v2/mea/calculate/type-4 - TOU tariff >=69kV', async () => {
      const requestData = {
        tariffType: 'tou',
        voltageLevel: '>=69kV',
        onPeakKwh: 2000,
        offPeakKwh: 3000,
        demand: 250
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-4')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-4',
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          totalAmount: expect.any(Number),
          strategyUsed: expect.stringContaining('MEA_4.2.1_large_TOU')
        }
      });
    });
  });

  describe('MEA Type 5 Calculations', () => {
    test('POST /api/v2/mea/calculate/type-5 - Normal tariff <12kV', async () => {
      const requestData = {
        tariffType: 'normal',
        voltageLevel: '<12kV',
        kwh: 1000,
        demand: 50
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-5')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          calculationType: 'type-5',
          tariffType: 'normal',
          voltageLevel: '<12kV',
          totalAmount: expect.any(Number),
          strategyUsed: expect.stringContaining('MEA_5.1.3_specific_normal')
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('POST /api/v2/mea/calculate/type-2 - Invalid tariff type', async () => {
      const requestData = {
        tariffType: 'invalid',
        voltageLevel: '<12kV',
        onPeakKwh: 300,
        offPeakKwh: 700
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(requestData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation Error'
      });
    });

    test('POST /api/v2/mea/calculate/type-4 - Normal tariff should fail', async () => {
      const requestData = {
        tariffType: 'normal',
        voltageLevel: '>=69kV',
        kwh: 5000,
        demand: 300
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-4')
        .send(requestData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid combination'
      });
    });

    test('POST /api/v2/mea/calculate/type-2 - Missing required fields', async () => {
      const requestData = {
        tariffType: 'tou',
        // Missing voltageLevel
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(requestData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation Error'
      });
    });
  });
});
