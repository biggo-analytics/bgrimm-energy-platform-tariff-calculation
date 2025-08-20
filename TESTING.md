# Testing Documentation

This document provides comprehensive information about testing the Koa Electricity Bill API, including how to run tests, what tests are included, and how to interpret the results.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Test Structure](#test-structure)
6. [Test Combinations](#test-combinations)
7. [Understanding Test Results](#understanding-test-results)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before running tests, ensure you have:

- Node.js (version 14.0.0 or higher)
- npm (comes with Node.js)
- All project dependencies installed

## Installation

1. Install project dependencies:
```bash
npm install
```

2. Verify that Jest and Supertest are installed:
```bash
npm list jest supertest
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Specific Test Commands

```bash
# Run tests for a specific file
npx jest tests/api.test.js

# Run tests matching a specific pattern
npx jest --testNamePattern="Type 2"

# Run tests with verbose output
npx jest --verbose

# Run tests and generate coverage report in HTML format
npx jest --coverage --coverageReporters=html
```

### Test Output Examples

**Successful test run:**
```
 PASS  tests/api.test.js
  MEA Electricity Bill Calculation API
    Type 2 - Small General Service
      Normal Tariff
        ✓ should calculate bill for <12kV with 500 kWh (15 ms)
        ✓ should calculate bill for <12kV with 150 kWh (first tier only) (3 ms)
        ✓ should calculate bill for <12kV with 400 kWh (two tiers) (2 ms)
        ✓ should calculate bill for 12-24kV with 1000 kWh (2 ms)
      TOU Tariff
        ✓ should calculate bill for <12kV TOU (2 ms)
        ✓ should calculate bill for 12-24kV TOU (2 ms)
      Validation Errors
        ✓ should return 400 for missing tariffType (2 ms)
        ✓ should return 400 for missing voltageLevel (2 ms)
        ✓ should return 400 for missing ftRateSatang (2 ms)
        ✓ should return 400 for missing usage (2 ms)
    Type 3 - Medium General Service
      Normal Tariff
        ✓ should calculate bill for >=69kV (3 ms)
        ✓ should calculate bill for 12-24kV (2 ms)
        ✓ should calculate bill for <12kV (2 ms)
      TOU Tariff
        ✓ should calculate bill for >=69kV TOU (2 ms)
        ✓ should calculate bill for 12-24kV TOU (2 ms)
        ✓ should calculate bill for <12kV TOU (2 ms)
      Minimum Bill Protection
        ✓ should apply minimum bill when calculated demand is lower (2 ms)
    Type 4 - Large General Service
      TOD Tariff
        ✓ should calculate bill for >=69kV TOD (2 ms)
        ✓ should calculate bill for 12-24kV TOD (2 ms)
        ✓ should calculate bill for <12kV TOD (2 ms)
      TOU Tariff
        ✓ should calculate bill for >=69kV TOU (2 ms)
        ✓ should calculate bill for 12-24kV TOU (2 ms)
        ✓ should calculate bill for <12kV TOU (2 ms)
    Type 5 - Specific Business
      Normal Tariff
        ✓ should calculate bill for >=69kV (2 ms)
        ✓ should calculate bill for 12-24kV (2 ms)
        ✓ should calculate bill for <12kV (2 ms)
      TOU Tariff
        ✓ should calculate bill for >=69kV TOU (2 ms)
        ✓ should calculate bill for 12-24kV TOU (2 ms)
        ✓ should calculate bill for <12kV TOU (2 ms)
    Power Factor Calculations
      ✓ should calculate power factor penalty correctly (2 ms)
      ✓ should have zero power factor penalty when within limits (2 ms)
    Edge Cases
      ✓ should handle zero usage gracefully (2 ms)
      ✓ should handle very high usage values (2 ms)

Test Suites: 1 passed, 1 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        2.145 s
```

## Test Coverage

### Coverage Report

When running `npm run test:coverage`, you'll get a detailed coverage report:

```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   95.45 |    88.89 |   100.00 |   95.45 |                  
 src/     |   95.45 |    88.89 |   100.00 |   95.45 |                  
  app.js  |   100.00 |    100.00 |   100.00 |   100.00 |                 
  routes/ |   100.00 |    100.00 |   100.00 |   100.00 |                 
   index.js |   100.00 |    100.00 |   100.00 |   100.00 |                 
   api.routes.js |   100.00 |    100.00 |   100.00 |   100.00 |                 
  controllers/ |   100.00 |    100.00 |   100.00 |   100.00 |                 
   health.controller.js |   100.00 |    100.00 |   100.00 |   100.00 |                 
   electricity.controller.js |   100.00 |    100.00 |   100.00 |   100.00 |                 
  services/ |   92.31 |    85.71 |   100.00 |   92.31 | 45,67,89,123,145 
   electricity.service.js |   92.31 |    85.71 |   100.00 |   92.31 | 45,67,89,123,145 
----------|---------|----------|---------|---------|-------------------
```

### Coverage Metrics Explained

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

## Test Structure

The test suite is organized into logical groups:

### 1. Type 2 - Small General Service
- **Normal Tariff Tests**: Tests for standard billing with tiered rates
- **TOU Tariff Tests**: Tests for Time-of-Use billing
- **Validation Error Tests**: Tests for input validation

### 2. Type 3 - Medium General Service
- **Normal Tariff Tests**: Tests for demand-based billing
- **TOU Tariff Tests**: Tests for Time-of-Use with demand charges
- **Minimum Bill Protection Tests**: Tests for minimum billing logic

### 3. Type 4 - Large General Service
- **TOD Tariff Tests**: Tests for Time-of-Day billing
- **TOU Tariff Tests**: Tests for Time-of-Use billing

### 4. Type 5 - Specific Business
- **Normal Tariff Tests**: Tests for business-specific billing
- **TOU Tariff Tests**: Tests for Time-of-Use business billing

### 5. Power Factor Calculations
- Tests for power factor penalty calculations
- Tests for power factor within acceptable limits

### 6. Edge Cases
- Tests for zero usage scenarios
- Tests for very high usage values

## Test Combinations

The test suite covers all possible combinations:

### Voltage Levels
- `<12kV`
- `12-24kV`
- `>=69kV`

### Tariff Types
- `normal` (standard billing)
- `tou` (Time-of-Use)
- `tod` (Time-of-Day, Type 4 only)

### Usage Patterns
- **Type 2**: Tiered energy consumption, TOU periods
- **Type 3**: Demand charges, energy consumption, TOU periods
- **Type 4**: Multiple demand periods, energy consumption, TOU periods
- **Type 5**: Business demand charges, energy consumption, TOU periods

### Special Features
- Power factor penalties
- Minimum bill protection
- Fuel adjustment charges
- VAT calculations

## Understanding Test Results

### Test Assertions

Each test validates:

1. **HTTP Status Codes**: Ensures correct response status (200 for success, 400 for validation errors)
2. **Response Structure**: Verifies all required fields are present
3. **Calculation Accuracy**: Validates mathematical calculations with expected precision
4. **Business Logic**: Ensures business rules are correctly applied

### Calculation Verification

Tests include detailed calculation verification:

```javascript
// Example: Type 2 tiered rate calculation
expect(response.body.energyCharge).toBeCloseTo(1984.88, 2);
// Breakdown: 150*3.2484 + 250*4.2218 + 100*4.4217 = 487.26 + 1055.45 + 442.17 = 1984.88
```

### Error Handling

Tests verify proper error handling:

```javascript
expect(response.status).toBe(400);
expect(response.body).toHaveProperty('error', 'Missing required field: tariffType');
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```
   Error: listen EADDRINUSE: address already in use :::3000
   ```
   **Solution**: Kill existing processes or use a different port

2. **Test Timeout**
   ```
   Timeout - Async callback was not invoked within the 5000ms timeout
   ```
   **Solution**: Increase timeout in Jest configuration or check for hanging promises

3. **Module Not Found**
   ```
   Cannot find module 'supertest'
   ```
   **Solution**: Run `npm install` to install dependencies

### Debugging Tests

1. **Run specific test with verbose output**:
   ```bash
   npx jest --testNamePattern="Type 2" --verbose
   ```

2. **Debug failing test**:
   ```bash
   npx jest --testNamePattern="should calculate bill for <12kV with 500 kWh" --verbose
   ```

3. **Check test coverage for specific file**:
   ```bash
   npx jest --coverage --collectCoverageFrom="src/services/electricity.service.js"
   ```

### Performance Optimization

1. **Run tests in parallel** (default behavior):
   ```bash
   npx jest --maxWorkers=4
   ```

2. **Run tests sequentially** (for debugging):
   ```bash
   npx jest --runInBand
   ```

3. **Cache test results**:
   ```bash
   npx jest --cache
   ```

## Continuous Integration

For CI/CD pipelines, use:

```bash
# Install dependencies
npm ci

# Run tests with coverage
npm run test:coverage

# Check coverage thresholds
npm run test:coverage -- --coverageThreshold='{"global":{"statements":90,"branches":80,"functions":100,"lines":90}}'
```

## Best Practices

1. **Always run tests before committing code**
2. **Maintain test coverage above 90%**
3. **Add tests for new features**
4. **Update tests when business logic changes**
5. **Use descriptive test names**
6. **Group related tests together**
7. **Test both success and error scenarios**
8. **Validate calculation accuracy with known values**

## Test Data

The test suite uses realistic test data that represents actual electricity consumption patterns:

- **Residential usage**: 150-1000 kWh
- **Commercial usage**: 10,000-100,000 kWh
- **Industrial usage**: 50,000-1,000,000 kWh
- **Demand values**: 50-500 kW
- **Power factor values**: 50-200 kVAR

All test data is designed to validate the business logic while remaining realistic for actual usage scenarios.
