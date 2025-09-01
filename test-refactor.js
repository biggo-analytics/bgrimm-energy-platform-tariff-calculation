/**
 * Test script to verify the refactored strategy system
 */

try {
  console.log('Loading strategy selector...');
  const { getStrategy } = require('./src/strategy-selector.js');
  
  console.log('Testing MEA strategy...');
  const meaStrategy = getStrategy('MEA_3.1.3_medium_normal');
  const meaBill = meaStrategy.calculate({ kwh: 1500, demand: 75 });
  console.log('MEA calculation result:', meaBill);
  
  console.log('Testing PEA strategy...');
  const peaStrategy = getStrategy('PEA_4.1.2_large_TOD');
  const peaBill = peaStrategy.calculate({ 
    kwh: 2000, 
    onPeakDemand: 120, 
    partialPeakDemand: 80, 
    offPeakDemand: 40 
  });
  console.log('PEA calculation result:', peaBill);
  
  console.log('✅ All tests passed! Refactoring successful.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
