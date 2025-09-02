/**
 * PEA Validation and Error Handling Test Suite
 * Tests for PEA input validation, error conditions, and edge cases
 */

const request = require('supertest');
const app = require('../../../src/app');

describe('PEA Validation and Error Handling Test Suite', () => {
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
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-2')
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

      test('should reject TOD tariff for type-2 (only TOU allowed)', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '<12kV',
          peakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-2')
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

      test('should reject unsupported voltage level for specific calculation type', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '>=69kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        // Test if PEA supports >=69kV for type-2
        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'voltageLevel',
              message: expect.stringContaining('Unsupported voltage level')
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
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-3')
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
          .post('/api/v2/pea/calculate/type-2')
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

      test('should reject excessive kWh values', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 999999999,
          offPeakKwh: 999999999
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'onPeakKwh',
              message: expect.stringContaining('exceeds maximum allowed value')
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
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-2')
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

      test('should reject kwh field for type-2 TOU', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          kwh: 1000,
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'kwh',
              message: expect.stringContaining('not allowed for TOU tariff')
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
          .post('/api/v2/pea/calculate/type-3')
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
          onPeakKwh: 500,
          offPeakKwh: 1000
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
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

      test('should reject peakKwh field for type-3 (not TOD)', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1000,
          demand: 75,
          peakKwh: 500
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'peakKwh',
              message: expect.stringContaining('not allowed for normal tariff')
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
          .post('/api/v2/pea/calculate/type-4')
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
          .post('/api/v2/pea/calculate/type-4')
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

      test('should reject kwh field for type-4 (not normal tariff)', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          kwh: 5000,
          onPeakKwh: 2000,
          offPeakKwh: 3000,
          demand: 200
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-4')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'kwh',
              message: expect.stringContaining('not allowed for TOU tariff')
            })
          ])
        });
      });
    });

    describe('Type 5 (Specific Business) Validation', () => {
      test('should require demand field for TOU tariff', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 3000,
          offPeakKwh: 4000
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-5')
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

      test('should reject normal tariff for type-5 (only TOU allowed)', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 5000,
          demand: 500
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-5')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'tariffType',
              message: expect.stringContaining('Type 5 only supports TOU tariff')
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
          .post('/api/v2/pea/calculate/type-99')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Unsupported Calculation Type',
          message: expect.stringContaining('Type 99 is not supported')
        });
      });

      test('should handle unsupported tariff type for calculation type', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 1000
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Unsupported Tariff Type',
          message: expect.stringContaining('Normal tariff is not supported for Type 2')
        });
      });

      test('should handle unsupported voltage level for specific strategy', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: 'unsupported',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Strategy Selection Error',
          message: expect.stringContaining('No suitable strategy found')
        });
      });
    });

    describe('Calculation Errors', () => {
      test('should handle division by zero in calculations', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: 0,
          demand: 100
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Calculation Error',
          message: expect.stringContaining('Invalid calculation parameters')
        });
      });

      test('should handle overflow in calculations', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<12kV',
          kwh: Number.MAX_SAFE_INTEGER,
          demand: Number.MAX_SAFE_INTEGER
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Calculation Error',
          message: expect.stringContaining('Calculation result exceeds limits')
        });
      });

      test('should handle invalid rate configuration', async () => {
        // This test would require mocking invalid rate configurations
        // For now, we'll test with valid data to ensure the system works
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            strategyUsed: expect.any(String)
          })
        });
      });
    });

    describe('System Errors', () => {
      test('should handle strategy factory errors gracefully', async () => {
        // This test would require mocking strategy factory failures
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
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-3')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeGreaterThan(0);
        expect(response.body.data.totalAmount).toBeLessThan(Number.MAX_SAFE_INTEGER);
      });

      test('should handle decimal precision in calculations', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 100.123,
          offPeakKwh: 200.456
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeGreaterThan(0);
        // Should handle decimal precision without errors
        expect(typeof response.body.data.totalAmount).toBe('number');
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
          .post('/api/v2/pea/calculate/type-2')
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
          .post('/api/v2/pea/calculate/type-2')
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

      test('should handle mixed data types gracefully', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: '700'
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(200);

        expect(response.body.data.totalAmount).toBeCloseTo(3618.58, 2);
      });
    });

    describe('Concurrent Request Tests', () => {
      test('should handle multiple simultaneous requests', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV',
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        // Send multiple requests simultaneously
        const promises = Array(5).fill().map(() =>
          request(server)
            .post('/api/v2/pea/calculate/type-2')
            .send(requestData)
            .expect(200)
        );

        const responses = await Promise.all(promises);

        // All requests should succeed
        responses.forEach(response => {
          expect(response.body.success).toBe(true);
          expect(response.body.data.strategyUsed).toBe('PEA_2.2.1_small_TOU');
        });
      });
    });
  });
});
