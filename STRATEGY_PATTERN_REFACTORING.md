# Strategy Pattern Refactoring Documentation

## Overview

This document outlines the complete refactoring of the electricity bill calculation system from monolithic rate configurations to a granular Strategy pattern implementation.

## Refactoring Objectives

1. **Modularity**: Break down large monolithic rate objects into individual, self-contained strategy modules
2. **Maintainability**: Each rate plan is now a separate file, making updates and debugging easier
3. **Extensibility**: New rate plans can be added without modifying existing code
4. **Testability**: Each strategy can be tested independently
5. **Type Safety**: Clear interfaces and validation for each strategy

## Architecture

### Before Refactoring

```
src/config/
├── mea-rates.js (Monolithic MEA_RATES object)
└── pea-rates.js (Monolithic PEA_RATES object)
```

### After Refactoring

```
src/
├── strategies/
│   ├── mea/
│   │   ├── MEA_2.2.1_small_TOU.js
│   │   ├── MEA_2.2.2_small_TOU.js
│   │   ├── MEA_3.1.1_medium_normal.js
│   │   └── ... (20 total MEA strategies)
│   └── pea/
│       ├── PEA_2.2.1_small_TOU.js
│       ├── PEA_2.2.2_small_TOU.js
│       ├── PEA_3.1.1_medium_normal.js
│       └── ... (20 total PEA strategies)
└── strategy-selector.js
```

## Strategy Naming Convention

Each strategy follows the naming pattern: `{AUTHORITY}_{TYPE}.{SUBTARIFF}.{VOLTAGE}_descriptive_name`

### MEA (Metropolitan Electricity Authority) Strategies

| Strategy Name | Original Type | Tariff | Voltage Level |
|---------------|---------------|---------|---------------|
| MEA_2.2.1_small_TOU | TYPE_2 | tou | <12kV |
| MEA_2.2.2_small_TOU | TYPE_2 | tou | 12-24kV |
| MEA_3.1.1_medium_normal | TYPE_3 | normal | >=69kV |
| MEA_3.1.2_medium_normal | TYPE_3 | normal | 12-24kV |
| MEA_3.1.3_medium_normal | TYPE_3 | normal | <12kV |
| MEA_3.2.1_medium_TOU | TYPE_3 | tou | >=69kV |
| MEA_3.2.2_medium_TOU | TYPE_3 | tou | 12-24kV |
| MEA_3.2.3_medium_TOU | TYPE_3 | tou | <12kV |
| MEA_4.1.1_large_TOD | TYPE_4 | tod | >=69kV |
| MEA_4.1.2_large_TOD | TYPE_4 | tod | 12-24kV |
| MEA_4.1.3_large_TOD | TYPE_4 | tod | <12kV |
| MEA_4.2.1_large_TOU | TYPE_4 | tou | >=69kV |
| MEA_4.2.2_large_TOU | TYPE_4 | tou | 12-24kV |
| MEA_4.2.3_large_TOU | TYPE_4 | tou | <12kV |
| MEA_5.1.1_specific_normal | TYPE_5 | normal | >=69kV |
| MEA_5.1.2_specific_normal | TYPE_5 | normal | 12-24kV |
| MEA_5.1.3_specific_normal | TYPE_5 | normal | <12kV |
| MEA_5.2.1_specific_TOU | TYPE_5 | tou | >=69kV |
| MEA_5.2.2_specific_TOU | TYPE_5 | tou | 12-24kV |
| MEA_5.2.3_specific_TOU | TYPE_5 | tou | <12kV |

### PEA (Provincial Electricity Authority) Strategies

| Strategy Name | Original Type | Tariff | Voltage Level |
|---------------|---------------|---------|---------------|
| PEA_2.2.1_small_TOU | TYPE_2 | tou | <22kV |
| PEA_2.2.2_small_TOU | TYPE_2 | tou | 22-33kV |
| PEA_3.1.1_medium_normal | TYPE_3 | normal | >=69kV |
| PEA_3.1.2_medium_normal | TYPE_3 | normal | 22-33kV |
| PEA_3.1.3_medium_normal | TYPE_3 | normal | <22kV |
| PEA_3.2.1_medium_TOU | TYPE_3 | tou | >=69kV |
| PEA_3.2.2_medium_TOU | TYPE_3 | tou | 22-33kV |
| PEA_3.2.3_medium_TOU | TYPE_3 | tou | <22kV |
| PEA_4.1.1_large_TOD | TYPE_4 | tod | >=69kV |
| PEA_4.1.2_large_TOD | TYPE_4 | tod | 22-33kV |
| PEA_4.1.3_large_TOD | TYPE_4 | tod | <22kV |
| PEA_4.2.1_large_TOU | TYPE_4 | tou | >=69kV |
| PEA_4.2.2_large_TOU | TYPE_4 | tou | 22-33kV |
| PEA_4.2.3_large_TOU | TYPE_4 | tou | <22kV |
| PEA_5.1.1_specific_TOU | TYPE_5 | normal | >=69kV |
| PEA_5.1.2_specific_TOU | TYPE_5 | normal | 22-33kV |
| PEA_5.1.3_specific_TOU | TYPE_5 | normal | <22kV |
| PEA_5.2.1_specific_TOU | TYPE_5 | tou | >=69kV |
| PEA_5.2.2_specific_TOU | TYPE_5 | tou | 22-33kV |
| PEA_5.2.3_specific_TOU | TYPE_5 | tou | <22kV |

## Strategy Structure

Each strategy file exports an object with two properties:

```javascript
const strategy = {
  config: {
    // Rate configuration specific to this strategy
    demand: 221.50,
    energy: 3.1751,
    serviceCharge: 312.24
  },

  calculate(params) {
    // Calculation logic specific to this strategy
    // Returns the total bill amount
  }
};

module.exports = strategy;
```

### Strategy Types and Parameters

#### Normal Tariff Strategies
- **Parameters**: `{ kwh, demand }`
- **Calculation**: Service charge + (demand × demand rate) + (kwh × energy rate)

#### TOU (Time of Use) Strategies
- **Parameters**: `{ onPeakKwh, offPeakKwh, demand }`
- **Calculation**: Service charge + (demand × demand rate) + (onPeakKwh × on-peak rate) + (offPeakKwh × off-peak rate)

#### TOD (Time of Day) Strategies
- **Parameters**: `{ kwh, onPeakDemand, partialPeakDemand, offPeakDemand }`
- **Calculation**: Service charge + (kwh × energy rate) + demand charges for each time period

#### Small TOU Strategies (TYPE_2)
- **Parameters**: `{ onPeakKwh, offPeakKwh }`
- **Calculation**: Service charge + (onPeakKwh × on-peak rate) + (offPeakKwh × off-peak rate)

## Strategy Selector

The `strategy-selector.js` module provides the central interface for loading strategies:

### API Methods

#### `getStrategy(strategyName)`
```javascript
const strategy = getStrategy('MEA_3.1.3_medium_normal');
const bill = strategy.calculate({ kwh: 1000, demand: 50 });
```

#### `getAvailableStrategies()`
```javascript
const available = getAvailableStrategies();
// Returns: { mea: [...], pea: [...], all: [...] }
```

#### `isValidStrategy(strategyName)`
```javascript
const isValid = isValidStrategy('MEA_3.1.3_medium_normal'); // true
```

## Usage Examples

### Basic Usage

```javascript
const { getStrategy } = require('./src/strategy-selector');

// Load a specific strategy
const strategy = getStrategy('MEA_3.1.3_medium_normal');

// Calculate bill
const bill = strategy.calculate({ kwh: 1500, demand: 75 });
console.log(`Total bill: ฿${bill}`);
```

### Error Handling

```javascript
try {
  const strategy = getStrategy('INVALID_STRATEGY');
} catch (error) {
  console.log('Strategy not found:', error.message);
}
```

### Dynamic Strategy Selection

```javascript
function calculateBill(authority, type, tariff, voltage, params) {
  const strategyName = `${authority}_${type}_${tariff}`;
  const strategy = getStrategy(strategyName);
  return strategy.calculate(params);
}
```

## Benefits of the New Architecture

### 1. **Maintainability**
- Each rate plan is in its own file
- Clear separation of concerns
- Easy to modify individual strategies without affecting others

### 2. **Testability**
- Each strategy can be unit tested independently
- Mock strategies can be easily created for testing
- Clear input/output contracts

### 3. **Extensibility**
- New strategies can be added by creating new files
- No need to modify existing code
- Follows Open/Closed Principle

### 4. **Performance**
- Strategies are loaded on demand
- Reduced memory footprint
- Faster startup times

### 5. **Type Safety**
- Clear parameter validation in each strategy
- Runtime type checking
- Better error messages

## Migration Guide

### From Old System
```javascript
// Old way
const { MEA_RATES } = require('./config/mea-rates');
const rate = MEA_RATES.TYPE_3.normal['<12kV'];
const bill = calculateBill(rate, params);
```

### To New System
```javascript
// New way
const { getStrategy } = require('./strategy-selector');
const strategy = getStrategy('MEA_3.1.3_medium_normal');
const bill = strategy.calculate(params);
```

## File Structure Summary

- **40 Strategy Files**: 20 MEA + 20 PEA strategies
- **1 Selector Module**: Central strategy loader
- **Clear Naming**: Consistent naming convention
- **Self-Contained**: Each strategy includes config and calculation logic
- **Validated**: Input validation and error handling

## Testing

Run the example script to see all strategies in action:

```bash
node example-usage.js
```

This will demonstrate:
- Loading different strategy types
- Performing calculations
- Error handling
- Strategy validation
- Available strategies listing

## Next Steps

1. **Integration**: Update existing controllers and services to use the new strategy system
2. **Testing**: Create comprehensive unit tests for each strategy
3. **Documentation**: Add JSDoc comments to all strategy files
4. **Validation**: Implement additional parameter validation as needed
5. **Performance**: Add caching for frequently used strategies
