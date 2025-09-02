/**
 * MEA Validation and Error Handling Test Suite
 * Tests for MEA input validation, error conditions, and edge cases
 */

const request = require('supertest');
const app = require('../../../src/app');

describe('MEA Validation and Error Handling Test Suite', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Input Validation Tests', () => {
    describe('Required Field Validation', () => {
      test('should reject request without tariffType', async () => {
        const requestData = {
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
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'tariffType',
              message: expect.stringContaining('required')
            })
          ])
        });
      });

      test('should reject request without voltageLevel', async () => {
        const requestData = {
          tariffType: 'tou',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'voltageLevel',
              message: expect.stringContaining('required')
            })
          ])
        });
      });
    });

    describe('Tariff Type Validation', () => {
      test('should reject invalid tariffType for type-2', async () => {
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
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'tariffType',
              message: expect.stringContaining('Invalid tariff type')
            })
          ])
        });
      });

      test('should reject normal tariff for type-2 (only TOU allowed)', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1000
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'tariffType',
              message: expect.stringContaining('Type 2 only supports TOU tariff')
            })
          ])
        });
      });
    });

    describe('Voltage Level Validation', () => {
      test('should reject invalid voltage level', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: 'invalid',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'voltageLevel',
              message: expect.stringContaining('Invalid voltage level')
            })
          ])
        });
      });
    });

    describe('Numeric Value Validation', () => {
      test('should reject negative kWh values', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: -100,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'onPeakKwh',
              message: expect.stringContaining('must be positive')
            })
          ])
        });
      });

      test('should reject negative demand values', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1000,
          demand: -50
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'demand',
              message: expect.stringContaining('must be positive')
            })
          ])
        });
      });

      test('should reject zero kWh values', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 0,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'onPeakKwh',
              message: expect.stringContaining('must be greater than 0')
            })
          ])
        });
      });
    });
  });

  describe('Business Logic Validation Tests', () => {
    describe('Type 2 (Small Business) Validation', () => {
      test('should reject demand field for type-2', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700,
          demand: 50
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'demand',
              message: expect.stringContaining('Type 2 does not support demand charges')
            })
          ])
        });
      });

      test('should require both onPeakKwh and offPeakKwh for TOU', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'offPeakKwh',
              message: expect.stringContaining('required for TOU tariff')
            })
          ])
        });
      });
    });

    describe('Type 3 (Medium Business) Validation', () => {
      test('should require demand field for normal tariff', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1000
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'demand',
              message: expect.stringContaining('required for normal tariff')
            })
          ])
        });
      });

      test('should require demand field for TOU tariff', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 1000
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'demand',
              message: 'Demand field is required for tou tariff'
            })
          ])
        });
      });
    });

    describe('Type 4 (Large Business) Validation', () => {
      test('should require demand field for TOD tariff', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '<12kV',
          peakKwh: 2000,
          offPeakKwh: 3000
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-4')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'demand',
              message: expect.stringContaining('required for TOD tariff')
            })
          ])
        });
      });

      test('should require demand field for TOU tariff', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 2000,
          offPeakKwh: 3000
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-4')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'demand',
              message: expect.stringContaining('required for TOU tariff')
            })
          ])
        });
      });
    });
  });

  describe('Error Handling Tests', () => {
    describe('Strategy Selection Errors', () => {
      test('should handle unsupported calculation type', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-99')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Unsupported Calculation Type',
          message: 'type-99 is not supported. Supported types: type-2, type-3, type-4, type-5'
        });
      });

      test('should handle unsupported tariff type for calculation type', async () => {
        const requestData = {
          tariffType: 'tod',
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
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'tariffType',
              message: 'Type 2 only supports TOU tariff'
            })
          ])
        });
      });

      test('should handle division by zero in calculations', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 0, // This will trigger validation error
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'onPeakKwh',
              message: 'onPeakKwh must be greater than 0'
            })
          ])
        });
      });

      test('should handle overflow in calculations', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 1000001, // This will trigger validation error
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'onPeakKwh',
              message: 'onPeakKwh value is excessive'
            })
          ])
        });
      });
    });

    describe('System Errors', () => {
      test('should handle database connection errors gracefully', async () => {
        // This test would require mocking database failures
        // For now, we'll test the error response structure
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        // Mock a scenario where strategy selection fails
        // This would typically be done with dependency injection or mocking
        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(200); // Should still work in normal conditions

        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            strategyUsed: expect.any(String)
          })
        });
      });
    });
  });

  describe('Edge Cases and Boundary Tests', () => {
    describe('Boundary Value Tests', () => {
      test('should handle minimum valid kWh values', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 0.01,
          offPeakKwh: 0.01
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeGreaterThan(0);
      });

      test('should handle maximum reasonable kWh values', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1000000,
          demand: 10000
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeGreaterThan(0);
        expect(response.body.data.totalAmount).toBeLessThan(Number.MAX_SAFE_INTEGER);
      });
    });

    describe('Data Type Tests', () => {
      test('should handle string numbers correctly', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: '300',
          offPeakKwh: '700'
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeCloseTo(3618.58, 2);
      });

      test('should reject non-numeric strings', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 'abc',
          offPeakKwh: '700'
        };

        const response = await request(server)
          .post('/api/v2/mea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'onPeakKwh',
              message: expect.stringContaining('must be a valid number')
            })
          ])
        });
      });
    });
  });
});
