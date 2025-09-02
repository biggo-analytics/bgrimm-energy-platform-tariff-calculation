# Strategy Pattern Test Suite

Test suite สำหรับการทดสอบ Strategy Pattern implementation ของ Electricity Tariff Calculation API

## โครงสร้างไฟล์

```
tests/strategies/
├── README.md                    # เอกสารนี้
├── index.js                     # Entry point หลักสำหรับ test suite
├── test-config.js              # Configuration และ test data
├── api-integration.test.js      # API integration และ strategy pattern tests
├── mea/                        # MEA strategy tests
│   ├── mea-strategies.test.js  # Tests สำหรับ MEA strategies
│   └── mea-validation-error.test.js # Validation และ error handling tests
└── pea/                        # PEA strategy tests
    ├── pea-strategies.test.js  # Tests สำหรับ PEA strategies
    └── pea-validation-error.test.js # Validation และ error handling tests
```

## การใช้งาน

### รัน Test ทั้งหมด

```bash
# รัน test ทั้งหมดใน strategies directory
npm test tests/strategies/

# รัน test เฉพาะ MEA
npm test tests/strategies/mea/

# รัน test เฉพาะ PEA
npm test tests/strategies/pea/

# รัน test เฉพาะ API integration
npm test tests/strategies/api-integration.test.js
```

### รัน Test เฉพาะ Category

```bash
# รันเฉพาะ strategy tests
npm test -- --testNamePattern="Strategies Test Suite"

# รันเฉพาะ validation tests
npm test -- --testNamePattern="Validation and Error Handling Test Suite"

# รันเฉพาะ integration tests
npm test -- --testNamePattern="API Integration and Strategy Pattern Test Suite"
```

## Test Categories

### 1. Strategy Tests (`*strategies.test.js`)
- ทดสอบการคำนวณของแต่ละ strategy
- ทดสอบการเลือก strategy ที่ถูกต้องตาม input parameters
- ทดสอบความถูกต้องของผลลัพธ์การคำนวณ

### 2. Validation & Error Tests (`*validation-error.test.js`)
- ทดสอบ input validation
- ทดสอบ business logic validation
- ทดสอบ error handling และ error messages
- ทดสอบ edge cases และ boundary conditions

### 3. API Integration Tests (`api-integration.test.js`)
- ทดสอบ API endpoints
- ทดสอบ strategy selection และ factory
- ทดสอบ performance และ load handling
- ทดสอบ error recovery และ resilience

## Test Data Configuration

ไฟล์ `test-config.js` ประกอบด้วย:

- **Test Data**: ข้อมูลสำหรับทดสอบแต่ละ strategy
- **Validation Data**: ข้อมูลสำหรับทดสอบ validation
- **Performance Config**: การตั้งค่าสำหรับ performance tests
- **Error Messages**: รูปแบบ error messages ที่คาดหวัง

## Test Helpers

### การใช้งาน Test Helpers

```javascript
const { helpers, testConfig } = require('./index');

// สร้าง test data
const requestData = helpers.createRequestData('tou', '<12kV', {
  onPeakKwh: 300,
  offPeakKwh: 700
});

// ทดสอบ strategy selection
await helpers.testStrategySelection(
  server,
  '/api/v2/mea/calculate/type-2',
  requestData,
  'MEA_2.2.1_small_TOU'
);

// ทดสอบ validation error
await helpers.testValidationError(
  server,
  '/api/v2/mea/calculate/type-2',
  invalidData,
  { error: 'Validation Error' }
);
```

### Performance Testing

```javascript
// ทดสอบ performance
const perfResult = await helpers.measurePerformance(async () => {
  // test function
}, 5);

console.log(`Average time: ${perfResult.average}ms`);

// Load testing
const loadResult = await helpers.loadTest(async () => {
  // test function
}, 10);

console.log(`Total time: ${loadResult.totalTime}ms`);
```

## การเพิ่ม Test ใหม่

### 1. เพิ่ม Strategy Test

```javascript
// ใน mea-strategies.test.js หรือ pea-strategies.test.js
describe('New Strategy Test', () => {
  test('should calculate correctly', async () => {
    const requestData = {
      tariffType: 'tou',
      voltageLevel: '<12kV',
      onPeakKwh: 300,
      offPeakKwh: 700
    };

    const response = await request(server)
      .post('/api/v2/mea/calculate/type-2')
      .send(requestData)
      .expect(200);

    expect(response.body.data.strategyUsed).toBe('EXPECTED_STRATEGY');
    expect(response.body.data.totalAmount).toBeCloseTo(EXPECTED_AMOUNT, 2);
  });
});
```

### 2. เพิ่ม Validation Test

```javascript
// ใน mea-validation-error.test.js หรือ pea-validation-error.test.js
describe('New Validation Test', () => {
  test('should reject invalid input', async () => {
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
      error: 'Validation Error'
    });
  });
});
```

### 3. เพิ่ม Test Data ใน Configuration

```javascript
// ใน test-config.js
testData: {
  mea: {
    type2: {
      tou: {
        '<12kV': {
          onPeakKwh: 300,
          offPeakKwh: 700,
          expectedStrategy: 'MEA_2.2.1_small_TOU',
          expectedAmount: 3618.58
        }
      }
    }
  }
}
```

## Best Practices

### 1. Test Naming
- ใช้ชื่อที่อธิบายสิ่งที่ทดสอบ
- ระบุ provider, calculation type, tariff type, และ voltage level
- ใช้ format: `should [expected behavior] when [condition]`

### 2. Test Structure
- ใช้ `describe` blocks เพื่อจัดกลุ่ม tests
- แยก test cases ตาม functionality
- ใช้ `beforeAll` และ `afterAll` สำหรับ setup และ cleanup

### 3. Assertions
- ทดสอบทั้ง success และ error cases
- ใช้ `toMatchObject` สำหรับ complex objects
- ทดสอบ boundary values และ edge cases

### 4. Performance Testing
- ทดสอบ concurrent requests
- ทดสอบ response time consistency
- ใช้ reasonable thresholds สำหรับ performance

## Troubleshooting

### Common Issues

1. **Test Timeout**: เพิ่ม timeout ใน test configuration
2. **Server Connection**: ตรวจสอบว่า app server ทำงานถูกต้อง
3. **Strategy Selection**: ตรวจสอบว่า strategy factory ทำงานถูกต้อง
4. **Validation Errors**: ตรวจสอบ error message patterns

### Debug Mode

```bash
# รัน test พร้อม debug output
DEBUG=* npm test tests/strategies/

# รัน test เฉพาะไฟล์พร้อม verbose output
npm test tests/strategies/mea/mea-strategies.test.js --verbose
```

## การอัพเดท Test Suite

เมื่อมีการเปลี่ยนแปลงใน strategies หรือ API:

1. อัพเดท test data ใน `test-config.js`
2. อัพเดท expected values ใน test cases
3. เพิ่ม test cases สำหรับ functionality ใหม่
4. อัพเดท error message patterns ถ้าจำเป็น
5. รัน test ทั้งหมดเพื่อตรวจสอบความถูกต้อง

## การรายงานผล

Test suite จะแสดงผลลัพธ์ในรูปแบบ:

```
Strategy Pattern Test Suite
✓ MEA Strategies Test Suite (45 tests)
✓ MEA Validation and Error Handling Test Suite (38 tests)
✓ PEA Strategies Test Suite (42 tests)
✓ PEA Validation and Error Handling Test Suite (40 tests)
✓ API Integration and Strategy Pattern Test Suite (25 tests)

Total: 190 tests passed
Time: 15.2s
```

## การติดต่อ

หากมีคำถามหรือปัญหากับ test suite กรุณาติดต่อทีม development หรือสร้าง issue ใน repository
