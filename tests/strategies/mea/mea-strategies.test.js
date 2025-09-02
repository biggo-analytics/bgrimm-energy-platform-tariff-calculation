/**
 * MEA Strategies Test Suite
 * Tests for all MEA tariff calculation strategies
 */

const request = require('supertest');
const app = require('../../../src/app');

describe('MEA Strategies Test Suite', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('MEA Type 2 Strategies (Small Business)', () => {
    describe('MEA_2.2.1_small_TOU - <12kV', () => {
      test('should calculate TOU tariff for <12kV correctly', async () => {
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
        expect(response.body.data.totalAmount).toBeCloseTo(3618.58, 2);
      });
    });

    describe('MEA_2.2.2_small_TOU - 12-24kV', () => {
      test('should calculate TOU tariff for 12-24kV correctly', async () => {
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

        expect(response.body.data.strategyUsed).toBe('MEA_2.2.2_small_TOU');
        expect(response.body.data.totalAmount).toBeCloseTo(3668.88, 2);
      });
    });
  });

  describe('MEA Type 3 Strategies (Medium Business)', () => {
    describe('Normal Tariff Strategies', () => {
      test('MEA_3.1.1_medium_normal - <12kV', async () => {
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
      });

      test('MEA_3.1.2_medium_normal - 12-24kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '12-24kV',
          kwh: 1500,
          demand: 75
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_3.1.2_medium_normal');
      });

      test('MEA_3.1.1_medium_normal - >=69kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          kwh: 1500,
          demand: 75
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_3.1.1_medium_normal');
      });
    });

    describe('TOU Tariff Strategies', () => {
      test('MEA_3.2.3_medium_TOU - <12kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 500,
          offPeakKwh: 1000,
          demand: 100
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_3.2.3_medium_TOU');
      });

      test('MEA_3.2.2_medium_TOU - 12-24kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '12-24kV',
          onPeakKwh: 500,
          offPeakKwh: 1000,
          demand: 100
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_3.2.2_medium_TOU');
      });

      test('MEA_3.2.1_medium_TOU - >=69kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          onPeakKwh: 500,
          offPeakKwh: 1000,
          demand: 100
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_3.2.1_medium_TOU');
      });
    });
  });

  describe('MEA Type 4 Strategies (Large Business)', () => {
    describe('TOD Tariff Strategies', () => {
      test('MEA_4.1.3_large_TOD - <12kV', async () => {
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

        expect(response.body.data.strategyUsed).toBe('MEA_4.1.3_large_TOD');
      });

      test('MEA_4.1.2_large_TOD - 12-24kV', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '12-24kV',
          kwh: 5000,
          onPeakDemand: 200,
          partialPeakDemand: 150,
          offPeakDemand: 100
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_4.1.2_large_TOD');
      });

      test('MEA_4.1.1_large_TOD - >=69kV', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '>=69kV',
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
      });
    });

    describe('TOU Tariff Strategies', () => {
      test('MEA_4.2.3_large_TOU - <12kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_4.2.3_large_TOU');
      });

      test('MEA_4.2.2_large_TOU - 12-24kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '12-24kV',
          onPeakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_4.2.2_large_TOU');
      });

      test('MEA_4.2.1_large_TOU - >=69kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          onPeakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_4.2.1_large_TOU');
      });
    });
  });

  describe('MEA Type 5 Strategies (Specific Business)', () => {
    describe('Normal Tariff Strategies', () => {
      test('MEA_5.1.3_specific_normal - <12kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 5000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_5.1.3_specific_normal');
      });

      test('MEA_5.1.2_specific_normal - 12-24kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '12-24kV',
          kwh: 5000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_5.1.2_specific_normal');
      });

      test('MEA_5.1.1_specific_normal - >=69kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          kwh: 5000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_5.1.1_specific_normal');
      });
    });

    describe('TOU Tariff Strategies', () => {
      test('MEA_5.2.3_specific_TOU - <12kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_5.2.3_specific_TOU');
      });

      test('MEA_5.2.2_specific_TOU - 12-24kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '12-24kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_5.2.2_specific_TOU');
      });

      test('MEA_5.2.1_specific_TOU - >=69kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('MEA_5.2.1_specific_TOU');
      });
    });
  });
});
