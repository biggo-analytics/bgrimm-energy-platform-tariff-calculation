/**
 * Example Usage of the New Strategy Pattern System
 * 
 * This example demonstrates how to use the refactored electricity bill
 * calculation system with the new granular strategy pattern.
 */

const { getStrategy, getAvailableStrategies, isValidStrategy } = require('./src/strategy-selector');

console.log('=== Electricity Bill Calculation Strategy Pattern Example ===\n');

// Example 1: MEA Medium Normal Calculation (<12kV)
console.log('1. MEA Medium Normal Calculation (<12kV):');
try {
  const meaStrategy = getStrategy('MEA_3.1.3_medium_normal');
  console.log('   Strategy Config:', meaStrategy.config);
  
  const bill = meaStrategy.calculate({ kwh: 1500, demand: 75 });
  console.log(`   Bill calculation for 1500 kWh, 75 kW demand: ฿${bill}`);
  console.log('   ✓ Success\n');
} catch (error) {
  console.log('   ✗ Error:', error.message, '\n');
}

// Example 2: PEA Large TOU Calculation (>=69kV)
console.log('2. PEA Large TOU Calculation (>=69kV):');
try {
  const peaStrategy = getStrategy('PEA_4.2.1_large_TOU');
  console.log('   Strategy Config:', peaStrategy.config);
  
  const bill = peaStrategy.calculate({ onPeakKwh: 800, offPeakKwh: 1200, demand: 100 });
  console.log(`   Bill calculation for 800 on-peak kWh, 1200 off-peak kWh, 100 kW demand: ฿${bill}`);
  console.log('   ✓ Success\n');
} catch (error) {
  console.log('   ✗ Error:', error.message, '\n');
}

// Example 3: MEA Small TOU Calculation (12-24kV)
console.log('3. MEA Small TOU Calculation (12-24kV):');
try {
  const meaSmallStrategy = getStrategy('MEA_2.2.2_small_TOU');
  console.log('   Strategy Config:', meaSmallStrategy.config);
  
  const bill = meaSmallStrategy.calculate({ onPeakKwh: 300, offPeakKwh: 700 });
  console.log(`   Bill calculation for 300 on-peak kWh, 700 off-peak kWh: ฿${bill}`);
  console.log('   ✓ Success\n');
} catch (error) {
  console.log('   ✗ Error:', error.message, '\n');
}

// Example 4: PEA Large TOD Calculation (22-33kV)
console.log('4. PEA Large TOD Calculation (22-33kV):');
try {
  const peaTodStrategy = getStrategy('PEA_4.1.2_large_TOD');
  console.log('   Strategy Config:', peaTodStrategy.config);
  
  const bill = peaTodStrategy.calculate({ 
    kwh: 2000, 
    onPeakDemand: 120, 
    partialPeakDemand: 80, 
    offPeakDemand: 40 
  });
  console.log(`   Bill calculation for 2000 kWh, 120/80/40 kW demand: ฿${bill}`);
  console.log('   ✓ Success\n');
} catch (error) {
  console.log('   ✗ Error:', error.message, '\n');
}

// Example 5: Strategy Validation
console.log('5. Strategy Validation:');
const testStrategies = [
  'MEA_3.1.3_medium_normal',
  'PEA_4.2.1_large_TOU', 
  'INVALID_STRATEGY_NAME',
  'MEA_5.2.3_specific_TOU'
];

testStrategies.forEach(strategyName => {
  const isValid = isValidStrategy(strategyName);
  console.log(`   ${strategyName}: ${isValid ? '✓ Valid' : '✗ Invalid'}`);
});

// Example 6: List all available strategies
console.log('\n6. Available Strategies Summary:');
const available = getAvailableStrategies();
console.log(`   MEA Strategies: ${available.mea.length}`);
console.log(`   PEA Strategies: ${available.pea.length}`);
console.log(`   Total Strategies: ${available.all.length}`);

console.log('\n   First 5 MEA Strategies:');
available.mea.slice(0, 5).forEach(strategy => {
  console.log(`     - ${strategy}`);
});

console.log('\n   First 5 PEA Strategies:');
available.pea.slice(0, 5).forEach(strategy => {
  console.log(`     - ${strategy}`);
});

console.log('\n=== Example Complete ===');

// Example 7: Error Handling
console.log('\n7. Error Handling Examples:');
try {
  getStrategy('');
} catch (error) {
  console.log('   ✓ Empty string handled:', error.message);
}

try {
  getStrategy('INVALID_FORMAT');
} catch (error) {
  console.log('   ✓ Invalid format handled:', error.message);
}

try {
  getStrategy('XYZ_1.1.1_test');
} catch (error) {
  console.log('   ✓ Invalid authority handled:', error.message);
}
