/**
 * PEA Strategies Test Suite
 * Tests for all PEA tariff calculation strategies
 */

const request = require('supertest');
const app = require('../../../src/app');

describe('PEA Strategies Test Suite', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('PEA Type 2 Strategies (Small Business)', () => {
    describe('PEA_2.2.1_small_TOU - <22kV', () => {
      test('should calculate TOU tariff for <22kV correctly', async () => {
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
        expect(response.body.data.totalAmount).toBeCloseTo(3618.58, 2);
      });
    });

    describe('PEA_2.2.2_small_TOU - 22-33kV', () => {
      test('should calculate TOU tariff for 22-33kV correctly', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_2.2.2_small_TOU');
        expect(response.body.data.totalAmount).toBeCloseTo(3588.58, 2);
      });
    });
  });

  describe('PEA Type 3 Strategies (Medium Business)', () => {
    describe('Normal Tariff Strategies', () => {
      test('PEA_3.1.1_medium_normal - <22kV', async () => {
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
      });

      test('PEA_3.1.2_medium_normal - 22-33kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '22-33kV',
          kwh: 1500,
          demand: 75
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_3.1.2_medium_normal');
      });

      test('PEA_3.1.3_medium_normal - >=69kV', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '>=69kV',
          kwh: 1500,
          demand: 75
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_3.1.3_medium_normal');
      });
    });

    describe('TOU Tariff Strategies', () => {
      test('PEA_3.2.1_medium_TOU - <22kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 500,
          offPeakKwh: 1000,
          demand: 100
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_3.2.1_medium_TOU');
      });

      test('PEA_3.2.2_medium_TOU - 22-33kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          onPeakKwh: 500,
          offPeakKwh: 1000,
          demand: 100
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_3.2.2_medium_TOU');
      });

      test('PEA_3.2.3_medium_TOU - >=69kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          onPeakKwh: 500,
          offPeakKwh: 1000,
          demand: 100
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_3.2.3_medium_TOU');
      });
    });
  });

  describe('PEA Type 4 Strategies (Large Business)', () => {
    describe('TOD Tariff Strategies', () => {
      test('PEA_4.1.1_large_TOD - <22kV', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '<22kV',
          peakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_4.1.1_large_TOD');
      });

      test('PEA_4.1.2_large_TOD - 22-33kV', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '22-33kV',
          peakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_4.1.2_large_TOD');
      });

      test('PEA_4.1.3_large_TOD - >=69kV', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '>=69kV',
          peakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_4.1.3_large_TOD');
      });
    });

    describe('TOU Tariff Strategies', () => {
      test('PEA_4.2.1_large_TOU - <22kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_4.2.1_large_TOU');
      });

      test('PEA_4.2.2_large_TOU - 22-33kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          onPeakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_4.2.2_large_TOU');
      });

      test('PEA_4.2.3_large_TOU - >=69kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          onPeakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-4')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_4.2.3_large_TOU');
      });
    });
  });

  describe('PEA Type 5 Strategies (Specific Business)', () => {
    describe('TOU Tariff Strategies', () => {
      test('PEA_5.1.1_specific_TOU - <22kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_5.1.1_specific_TOU');
      });

      test('PEA_5.1.2_specific_TOU - 22-33kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_5.1.2_specific_TOU');
      });

      test('PEA_5.1.3_specific_TOU - >=69kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_5.1.3_specific_TOU');
      });
    });

    describe('TOU Tariff Strategies (Advanced)', () => {
      test('PEA_5.2.1_specific_TOU - <22kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_5.2.1_specific_TOU');
      });

      test('PEA_5.2.2_specific_TOU - 22-33kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '22-33kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_5.2.2_specific_TOU');
      });

      test('PEA_5.2.3_specific_TOU - >=69kV', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-5')
          .send(requestData)
          .expect(200);

        expect(response.body.data.strategyUsed).toBe('PEA_5.2.3_specific_TOU');
      });
    });
  });
});
