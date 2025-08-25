# Test Documentation

## Overview

This document provides comprehensive documentation for the test suite of the BGRIM Energy Platform Tariff Calculation system. The tests are organized by provider (MEA/PEA) and calculation type to ensure clear separation and comprehensive coverage.

## Test Structure

### Directory Organization

```
tests/
├── mea/                          # MEA-specific tests
│   ├── mea-calculate-type-2.test.js
│   ├── mea-calculate-type-3.test.js
│   ├── mea-calculate-type-4.test.js
│   └── mea-calculate-type-5.test.js
├── pea/                          # PEA-specific tests
│   ├── pea-calculate-type-2.test.js
│   ├── pea-calculate-type-3.test.js
│   ├── pea-calculate-type-4.test.js
│   └── pea-calculate-type-5.test.js
├── integration/                  # Integration tests
│   ├── api-health.test.js
│   └── cross-provider.test.js
└── utils/                        # Test utilities
    ├── test-helpers.js
    └── test-data.js
```

### Test File Naming Convention

- **Format**: `{provider}-calculate-type-{number}.test.js`
- **Examples**:
  - `mea-calculate-type-2.test.js` - MEA Type 2 calculations
  - `pea-calculate-type-5.test.js` - PEA Type 5 calculations

## Test Categories

### 1. Valid Input Tests
Tests that verify correct calculation results with valid input data.

#### Test Cases Include:
- **Normal scenarios**: Standard consumption values
- **Boundary values**: Minimum and maximum reasonable values
- **Edge cases**: Zero values, decimal values, very large values
- **Different voltage levels**: All supported voltage levels for each provider
- **Different tariff types**: Normal, TOU, TOD (where applicable)

#### Example Test Data:
```javascript
// Normal scenario
{
  tariffType: 'normal',
  voltageLevel: '<22kV',
  ftRateSatang: 39.72,
  usage: {
    total_kwh: 500
  }
}

// TOU scenario
{
  tariffType: 'tou',
  voltageLevel: '<22kV',
  ftRateSatang: 39.72,
  usage: {
    on_peak_kwh: 200,
    off_peak_kwh: 300
  }
}
```

### 2. Validation Error Tests
Tests that verify proper error handling for invalid inputs.

#### Categories:

##### Missing Required Fields
- Missing request body
- Missing `tariffType`
- Missing `voltageLevel`
- Missing `ftRateSatang`
- Missing `usage` object
- Missing required usage fields (`total_kwh`, `on_peak_kwh`, etc.)

##### Invalid Field Values
- Invalid tariff types (e.g., 'invalid', 'tod' for Type 2)
- Invalid voltage levels (e.g., 'invalid', '50kV')
- Negative values for numeric fields
- Zero values where not allowed

##### Invalid Data Types
- String values for numeric fields
- Boolean values for string fields
- Array values for object fields

##### Empty Values
- Empty strings (`''`)
- Empty objects (`{}`)
- Whitespace-only strings

##### Null and Undefined Values
- `null` values
- `undefined` values

### 3. Calculation Accuracy Tests
Tests that verify mathematical accuracy of calculations.

#### Verification Methods:
- **Manual calculations**: Compare with hand-calculated expected values
- **Tiered rate verification**: Ensure correct tier application
- **VAT calculation**: Verify 7% VAT application
- **FT charge calculation**: Verify fuel adjustment factor
- **Rounding accuracy**: Ensure proper decimal precision

## Test Data Reference

### MEA Test Data

#### Voltage Levels
- `<12kV` - Low voltage (residential/small business)
- `12-24kV` - Medium voltage (commercial)
- `>=69kV` - High voltage (industrial)

#### Tariff Types
- **Type 2**: `normal`, `tou`
- **Type 3**: `normal`, `tou`
- **Type 4**: `tod`, `tou`
- **Type 5**: `normal`, `tou`

#### Rate Examples (Type 2 Normal - <12kV)
```javascript
// Tiered rates
{
  serviceCharge: 33.29,
  energyRates: [
    { threshold: 0, rate: 3.2484 },   // First 150 kWh
    { threshold: 150, rate: 4.2218 }, // 151-400 kWh
    { threshold: 400, rate: 4.4217 }  // Over 400 kWh
  ]
}
```

### PEA Test Data

#### Voltage Levels
- `<22kV` - Low voltage (residential/small business)
- `22-33kV` - Medium voltage (commercial)
- `>=69kV` - High voltage (industrial)

#### Tariff Types
- **Type 2**: `normal`, `tou`
- **Type 3**: `normal`, `tou`
- **Type 4**: `tod`, `tou`
- **Type 5**: `normal`, `tou`

#### Rate Examples (Type 2 Normal - <22kV)
```javascript
// Tiered rates (same as MEA for Type 2)
{
  serviceCharge: 33.29,
  energyRates: [
    { threshold: 0, rate: 3.2484 },   // First 150 kWh
    { threshold: 150, rate: 4.2218 }, // 151-400 kWh
    { threshold: 400, rate: 4.4217 }  // Over 400 kWh
  ]
}
```

## Calculation Verification

### Tiered Rate Calculation Example

For 600 kWh consumption at `<22kV` normal tariff:

```javascript
// Manual calculation:
// First 150 kWh: 150 * 3.2484 = 487.26
// Next 250 kWh (151-400): 250 * 4.2218 = 1055.45
// Remaining 200 kWh (401-600): 200 * 4.4217 = 884.34
// Total: 487.26 + 1055.45 + 884.34 = 2427.05

expect(response.body.energyCharge).toBeCloseTo(2427.05, 2);
```

### TOU Rate Calculation Example

For 200 on-peak + 300 off-peak kWh at `<22kV` TOU tariff:

```javascript
// Manual calculation:
// On-peak: 200 * 5.7982 = 1159.64
// Off-peak: 300 * 2.6369 = 791.07
// Total: 1159.64 + 791.07 = 1950.71

expect(response.body.energyCharge).toBeCloseTo(1950.71, 2);
```

### VAT Calculation Example

```javascript
// Manual VAT calculation:
// Base tariff = energy charge + service charge = 1984.88 + 33.29 = 2018.17
// FT charge = 500 * 39.72 / 100 = 198.60
// VAT = (2018.17 + 198.60) * 0.07 = 155.17

expect(response.body.vat).toBeCloseTo(155.17, 2);
```

## Test Execution

### Running All Tests
```bash
npm test
```

### Running Specific Provider Tests
```bash
# MEA tests only
npm test -- tests/mea/

# PEA tests only
npm test -- tests/pea/
```

### Running Specific Type Tests
```bash
# Type 2 tests only
npm test -- --testNamePattern="Type 2"

# Type 5 tests only
npm test -- --testNamePattern="Type 5"
```

### Running with Coverage
```bash
npm run test:coverage
```

## Test Coverage Goals

### Functional Coverage
- ✅ All calculation types (Type 2, 3, 4, 5)
- ✅ All tariff types (normal, TOU, TOD)
- ✅ All voltage levels for each provider
- ✅ All edge cases and boundary conditions
- ✅ All error scenarios

### Code Coverage Targets
- **Statements**: >95%
- **Branches**: >90%
- **Functions**: >95%
- **Lines**: >95%

## Error Testing Guidelines

### HTTP Status Codes
- **200**: Successful calculation
- **400**: Bad request (validation errors)
- **500**: Internal server error (unexpected errors)

### Error Response Format
```javascript
{
  "error": "Error message description",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "success": false,
  "field": "fieldName" // Optional
}
```

### Validation Error Messages
- **Missing fields**: "Missing required field: {fieldName}"
- **Invalid tariff type**: "Invalid tariff type for Type {X}. Must be \"{validTypes}\", received: {invalidValue}"
- **Invalid voltage level**: "Invalid voltage level for Type {X} {tariffType}. Must be \"{validLevels}\", received: {invalidValue}"

## Performance Testing

### Response Time Expectations
- **Simple calculations**: <100ms
- **Complex calculations**: <500ms
- **Error responses**: <50ms

### Load Testing
- **Concurrent requests**: 100+ simultaneous calculations
- **Memory usage**: <100MB for typical usage
- **CPU usage**: <50% under normal load

## Test Data Management

### Test Constants
```javascript
// Common test values
const TEST_VALUES = {
  FT_RATES: [0, 19.72, 39.72, 100.0],
  CONSUMPTION_LEVELS: [1, 150, 400, 500, 1000, 10000],
  VOLTAGE_LEVELS: {
    MEA: ['<12kV', '12-24kV', '>=69kV'],
    PEA: ['<22kV', '22-33kV', '>=69kV']
  }
};
```

### Test Fixtures
```javascript
// Reusable test data
const VALID_TYPE_2_NORMAL = {
  tariffType: 'normal',
  voltageLevel: '<22kV',
  ftRateSatang: 39.72,
  usage: {
    total_kwh: 500
  }
};
```

## Continuous Integration

### Pre-commit Hooks
- Run linting: `npm run lint`
- Run tests: `npm test`
- Check coverage: `npm run test:coverage`

### CI Pipeline
1. **Install dependencies**: `npm install`
2. **Run linting**: `npm run lint`
3. **Run tests**: `npm test`
4. **Generate coverage report**: `npm run test:coverage`
5. **Upload coverage**: To coverage service
6. **Deploy**: If all checks pass

## Troubleshooting

### Common Test Issues

#### Port Conflicts
```javascript
// Use random port for testing
const server = app.listen(0);
```

#### Async/Await Issues
```javascript
// Always use async/await for API calls
test('should calculate bill', async () => {
  const response = await request(server)
    .post('/api/pea/calculate/type-2')
    .send(testData);
  
  expect(response.status).toBe(200);
});
```

#### Floating Point Precision
```javascript
// Use toBeCloseTo for floating point comparisons
expect(response.body.energyCharge).toBeCloseTo(expectedValue, 2);
```

#### Test Isolation
```javascript
// Clean up after each test
afterAll((done) => {
  server.close(done);
});
```

## Best Practices

### Test Organization
1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the scenario
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** - no shared state between tests

### Test Data
1. **Use realistic values** that represent actual usage
2. **Include edge cases** and boundary conditions
3. **Document calculation methods** in comments
4. **Use constants** for repeated values

### Error Testing
1. **Test all error scenarios** systematically
2. **Verify error messages** are helpful and accurate
3. **Check HTTP status codes** are appropriate
4. **Test both client and server errors**

### Performance
1. **Mock external dependencies** when possible
2. **Use efficient test data** structures
3. **Clean up resources** after tests
4. **Monitor test execution time**

## Future Enhancements

### Planned Test Improvements
- **Property-based testing** using fast-check
- **Contract testing** for API compatibility
- **Visual regression testing** for response format
- **Load testing** with Artillery or similar tools
- **Security testing** for input validation
- **Integration testing** with real database

### Test Automation
- **Auto-generation** of test cases from rate tables
- **Mutation testing** to improve test quality
- **Test data factories** for complex scenarios
- **Parallel test execution** for faster feedback

This comprehensive test documentation ensures that all aspects of the electricity calculation system are thoroughly tested and validated, providing confidence in the accuracy and reliability of the calculations.
