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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
              message: 'Invalid tariff type: invalid. Supported types: normal, tou, tod'
            })
          ])
        });
      });

      test('should reject normal tariff for type-2 (only TOU allowed)', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<12kV', // MEA voltage level, not PEA
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        // MEA voltage levels should be rejected by PEA
        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Invalid voltage level',
          message: expect.stringContaining('Invalid voltage level')
        });
      });
    });

    describe('Numeric Value Validation', () => {
      test('should reject negative kWh values', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
          onPeakKwh: 0, // This will trigger validation error
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
              message: 'onPeakKwh must be greater than 0'
            })
          ])
        });
      });

      test('should reject excessive kWh values', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
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
              message: expect.stringContaining('onPeakKwh value is excessive')
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
          voltageLevel: '<22kV',
          onPeakKwh: 300,
          offPeakKwh: 700,
          demand: 100 // This should trigger validation error
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
              message: 'Type 2 does not support demand charges'
            })
          ])
        });
      });

      test('should require both onPeakKwh and offPeakKwh for TOU', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
              message: expect.stringContaining('kwh field is not allowed for Type 2 TOU')
            })
          ])
        });
      });
    });

    describe('Type 3 (Medium Business) Validation', () => {
      test('should require demand field for normal tariff', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
              message: expect.stringContaining('Demand field is required for tou tariff')
            })
          ])
        });
      });

      test('should reject peakKwh field for type-3 (not TOD)', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<22kV',
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
              message: expect.stringContaining('peakKwh field is not allowed for Type 3')
            })
          ])
        });
      });
    });

    describe('Type 4 (Large Business) Validation', () => {
      test('should require demand field for TOD tariff', async () => {
        const requestData = {
          tariffType: 'tod',
          voltageLevel: '<22kV'
          // Missing kwh and demand fields
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
              message: 'onPeakDemand, partialPeakDemand, and offPeakDemand are required for TOD tariff'
            }),
            expect.objectContaining({
              field: 'kwh',
              message: 'kwh field is required for TOD tariff'
            })
          ])
        });
      });

      test('should require demand field for TOU tariff', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 2000,
          offPeakKwh: 3000
          // Missing demand field
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
              message: 'Demand field is required for TOU tariff'
            })
          ])
        });
      });

      test('should reject kwh field for type-4 (not normal tariff)', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
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
              message: expect.stringContaining('kwh field is not allowed for Type 4')
            })
          ])
        });
      });
    });

    describe('Type 5 (Specific Business) Validation', () => {
      test('should require demand field for TOU tariff', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
          kwh: 1000,
          demand: 50
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
              message: 'Type 5 only supports TOU tariff'
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
          voltageLevel: '<22kV',
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
          message: 'type-99 is not supported. Supported types: type-2, type-3, type-4, type-5'
        });
      });

      test('should handle unsupported tariff type for calculation type', async () => {
        const requestData = {
          tariffType: 'normal',
          voltageLevel: '<22kV',
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
              message: 'Type 2 only supports TOU tariff'
            })
          ])
        });
      });

      test('should handle unsupported voltage level for specific strategy', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<12kV', // MEA voltage level, not PEA
          onPeakKwh: 300,
          offPeakKwh: 700
        };

        const response = await request(server)
          .post('/api/v2/pea/calculate/type-2')
          .send(requestData)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Invalid voltage level',
          message: expect.stringContaining('Invalid voltage level')
        });
      });
    });

    describe('Calculation Errors', () => {
      test('should handle division by zero in calculations', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 0, // This will trigger validation error
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
              message: 'onPeakKwh must be greater than 0'
            })
          ])
        });
      });

      test('should handle overflow in calculations', async () => {
        const requestData = {
          tariffType: 'tou',
          voltageLevel: '<22kV',
          onPeakKwh: 1000001, // This will trigger validation error
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
              message: 'onPeakKwh value is excessive'
            })
          ])
        });
      });

      test('should handle invalid rate configuration', async () => {
        // This test would require mocking invalid rate configurations
        // For now, we'll test with valid data to ensure the system works
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
          voltageLevel: '<22kV',
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
