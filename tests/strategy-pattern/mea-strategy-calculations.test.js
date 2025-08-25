/**
 * MEA Strategy Pattern Calculation Tests
 * Tests for MEA calculations using the strategy pattern
 */

const request = require('supertest');
const app = require('../../src/app');

describe('MEA Strategy Pattern Calculations', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });
  
  describe('MEA Type 2 Calculations', () => {
    test('POST /api/v2/mea/calculate/type-2 - Normal tariff <12kV', async () => {
      const requestData = {
        tariffType: 'normal',
        voltageLevel: '<12kV',
        ftRateSatang: 19.72,
        usage: {
          total_kwh: 500
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        provider: 'mea',
        calculationType: 'type-2',
        energyCharge: expect.any(Number),
        serviceCharge: 33.29,
        baseTariff: expect.any(Number),
        ftCharge: expect.any(Number),
        vat: expect.any(Number),
        totalBill: expect.any(Number)
      });

      // Verify calculation accuracy
      expect(response.body.energyCharge).toBeCloseTo(1984.88, 2);
      expect(response.body.ftCharge).toBeCloseTo(98.6, 2);
    });

    test('POST /api/v2/mea/calculate/type-2 - Normal tariff 12-24kV', async () => {
      const requestData = {
        tariffType: 'normal',
        voltageLevel: '12-24kV',
        ftRateSatang: 19.72,
        usage: {
          total_kwh: 1000
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        serviceCharge: 312.24,
        energyCharge: expect.any(Number),
        totalBill: expect.any(Number)
      });

      // Verify flat rate calculation
      expect(response.body.energyCharge).toBeCloseTo(3908.6, 2);
    });

    test('POST /api/v2/mea/calculate/type-2 - TOU tariff', async () => {
      const requestData = {
        tariffType: 'tou',
        voltageLevel: '<12kV',
        ftRateSatang: 19.72,
        usage: {
          on_peak_kwh: 300,
          off_peak_kwh: 200
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        provider: 'mea',
        calculationType: 'type-2',
        energyCharge: expect.any(Number),
        serviceCharge: 33.29,
        totalBill: expect.any(Number)
      });

      // Verify TOU calculation
      const expectedEnergyCharge = (300 * 5.7982) + (200 * 2.6369);
      expect(response.body.energyCharge).toBeCloseTo(expectedEnergyCharge, 2);
    });
  });

  describe('MEA Type 3 Calculations', () => {
    test('POST /api/v2/mea/calculate/type-3 - Normal tariff', async () => {
      const requestData = {
        tariffType: 'normal',
        voltageLevel: '>=69kV',
        ftRateSatang: 19.72,
        peakKvar: 100,
        highestDemandChargeLast12m: 1000,
        usage: {
          total_kwh: 2000,
          peak_kw: 150
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-3')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        provider: 'mea',
        calculationType: 'type-3',
        calculatedDemandCharge: expect.any(Number),
        energyCharge: expect.any(Number),
        effectiveDemandCharge: expect.any(Number),
        pfCharge: expect.any(Number),
        serviceCharge: 312.24,
        grandTotal: expect.any(Number)
      });

      // Verify demand charge calculation
      expect(response.body.calculatedDemandCharge).toBeCloseTo(150 * 175.70, 1);
    });

    test('POST /api/v2/mea/calculate/type-3 - TOU tariff', async () => {
      const requestData = {
        tariffType: 'tou',
        voltageLevel: '12-24kV',
        ftRateSatang: 19.72,
        peakKvar: 150,
        highestDemandChargeLast12m: 1500,
        usage: {
          on_peak_kwh: 1200,
          off_peak_kwh: 800,
          on_peak_kw: 180,
          off_peak_kw: 120
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-3')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        provider: 'mea',
        calculationType: 'type-3',
        calculatedDemandCharge: expect.any(Number),
        energyCharge: expect.any(Number),
        grandTotal: expect.any(Number)
      });

      // Verify TOU demand charge
      expect(response.body.calculatedDemandCharge).toBeCloseTo(180 * 132.93, 1);
    });
  });

  describe('MEA Type 4 Calculations', () => {
    test('POST /api/v2/mea/calculate/type-4 - TOD tariff', async () => {
      const requestData = {
        tariffType: 'tod',
        voltageLevel: '>=69kV',
        ftRateSatang: 19.72,
        peakKvar: 200,
        highestDemandChargeLast12m: 2000,
        usage: {
          total_kwh: 5000,
          on_peak_kw: 300,
          partial_peak_kw: 250,
          off_peak_kw: 200
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-4')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        provider: 'mea',
        calculationType: 'type-4',
        calculatedDemandCharge: expect.any(Number),
        energyCharge: expect.any(Number),
        grandTotal: expect.any(Number)
      });

      // Verify TOD demand charge calculation
      const expectedDemandCharge = (300 * 280.00) + (250 * 74.14) + (200 * 0);
      expect(response.body.calculatedDemandCharge).toBeCloseTo(expectedDemandCharge, 1);
    });

    test('POST /api/v2/mea/calculate/type-4 - TOU tariff', async () => {
      const requestData = {
        tariffType: 'tou',
        voltageLevel: '<12kV',
        ftRateSatang: 19.72,
        peakKvar: 180,
        highestDemandChargeLast12m: 1800,
        usage: {
          on_peak_kwh: 2000,
          off_peak_kwh: 3000,
          on_peak_kw: 250,
          off_peak_kw: 200
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-4')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        provider: 'mea',
        calculationType: 'type-4',
        calculatedDemandCharge: expect.any(Number),
        energyCharge: expect.any(Number),
        grandTotal: expect.any(Number)
      });

      // Verify TOU demand charge
      expect(response.body.calculatedDemandCharge).toBeCloseTo(250 * 210.80, 1);
    });
  });

  describe('MEA Type 5 Calculations', () => {
    test('POST /api/v2/mea/calculate/type-5 - Normal tariff', async () => {
      const requestData = {
        tariffType: 'normal',
        voltageLevel: '<12kV',
        ftRateSatang: 19.72,
        peakKvar: 120,
        highestDemandChargeLast12m: 1200,
        usage: {
          total_kwh: 1800,
          peak_kw: 160
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-5')
        .send(requestData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        provider: 'mea',
        calculationType: 'type-5',
        calculatedDemandCharge: expect.any(Number),
        energyCharge: expect.any(Number),
        grandTotal: expect.any(Number)
      });

      // Verify Type 5 demand charge
      expect(response.body.calculatedDemandCharge).toBeCloseTo(160 * 276.64, 1);
    });
  });

  describe('Error Handling', () => {
    test('POST /api/v2/mea/calculate/type-2 - Invalid tariff type', async () => {
      const requestData = {
        tariffType: 'invalid',
        voltageLevel: '<12kV',
        ftRateSatang: 19.72,
        usage: {
          total_kwh: 500
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(requestData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining("invalid")
      });
    });

    test('POST /api/v2/mea/calculate/type-4 - Normal tariff should fail', async () => {
      const requestData = {
        tariffType: 'normal',
        voltageLevel: '>=69kV',
        ftRateSatang: 19.72,
        peakKvar: 200,
        highestDemandChargeLast12m: 2000,
        usage: {
          total_kwh: 5000,
          peak_kw: 300
        }
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-4')
        .send(requestData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining("not valid for type-4")
      });
    });

    test('POST /api/v2/mea/calculate/type-2 - Missing required fields', async () => {
      const requestData = {
        tariffType: 'normal',
        // Missing voltageLevel, ftRateSatang, usage
      };

      const response = await request(server)
        .post('/api/v2/mea/calculate/type-2')
        .send(requestData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining("required field")
      });
    });
  });
});
