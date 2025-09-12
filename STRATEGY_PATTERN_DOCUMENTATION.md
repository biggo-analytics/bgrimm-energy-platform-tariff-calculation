# รายงานการใช้งาน Dynamic Strategy Design Pattern
## ระบบคำนวณค่าไฟฟ้า BGRIM Energy Platform (Version 4.0)

---

## สารบัญ

1. [ภาพรวมของระบบ](#ภาพรวมของระบบ)
2. [การออกแบบ Dynamic Strategy Pattern](#การออกแบบ-dynamic-strategy-pattern)
3. [โครงสร้างของ Strategy Interface](#โครงสร้างของ-strategy-interface)
4. [Dynamic Strategy Factory และการจัดการ](#dynamic-strategy-factory-และการจัดการ)
5. [การใช้งาน Strategies แต่ละประเภท](#การใช้งาน-strategies-แต่ละประเภท)
6. [ตัวอย่างการใช้งานแบบละเอียด](#ตัวอย่างการใช้งานแบบละเอียด)
7. [การทดสอบและตรวจสอบ](#การทดสอบและตรวจสอบ)
8. [การเพิ่ม Strategy ใหม่](#การเพิ่ม-strategy-ใหม่)

---

## ภาพรวมของระบบ

### ข้อมูลพื้นฐาน
- **ผู้ให้บริการ**: MEA และ PEA
- **ประเภทการคำนวณ**: Type 2, 3, 4, 5
- **รูปแบบการคิดค่าไฟฟ้า**: Normal, TOU (Time of Use), TOD (Time of Day)
- **ระดับแรงดันไฟฟ้า**: <12kV, 12-24kV, <22kV, 22-33kV, >=69kV
- **ขนาดลูกค้า**: Small, Medium, Large, Specific

### จำนวน Strategy ทั้งหมด
```
MEA Strategies: 20 ตัว
PEA Strategies: 20 ตัว
รวมทั้งหมด: 40 ตัว
```

### คุณสมบัติใหม่ใน Version 4.0
- **Dynamic Loading**: โหลด Strategy แบบอัตโนมัติจากไฟล์
- **File System Discovery**: ค้นหา Strategy จากชื่อไฟล์
- **Simplified API**: ใช้ชื่อ Tariff Plan แทน 4 parameters
- **Auto-Discovery**: เพิ่ม Strategy ใหม่ได้โดยไม่ต้องแก้ไขโค้ด

---

## การออกแบบ Dynamic Strategy Pattern

### 1. Strategy Interface (ICalculationStrategy)

Strategy Interface เป็นพื้นฐานของทุก Strategy โดยกำหนดโครงสร้างและวิธีการที่ทุก Strategy ต้องมี:

```javascript
class ICalculationStrategy {
  constructor(rates, serviceCharge = null) {
    this.rates = rates;
    this.serviceCharge = serviceCharge;
  }

  // วิธีการหลักที่ทุก Strategy ต้องมี
  calculate(data) { /* ต้องถูก override */ }
  getProvider() { /* ต้องถูก override */ }
  getCalculationType() { /* ต้องถูก override */ }
  getTariffModel() { /* ต้องถูก override */ }
  getVoltageLevel() { /* ต้องถูก override */ }
  getCustomerSize() { /* ต้องถูก override */ }
  
  // วิธีการตรวจสอบข้อมูล
  validateInput(data) { /* มีการ implement พื้นฐาน */ }
  validateOtherFields(data) { /* มีการ implement พื้นฐาน */ }
  validateUsageFields(data) { /* มีการ implement พื้นฐาน */ }
}
```

### 2. Shared Calculation Utilities

ระบบใช้ Shared Calculation Utilities เพื่อลดการเขียนโค้ดซ้ำ:

```javascript
// ตัวอย่างฟังก์ชันที่ใช้ร่วมกัน
const { 
  calculateTOUCharge,
  calculateBasicDemandCharge,
  calculateCompleteBill,
  normalizeUsageData
} = require('./shared-calculation-utils');
```

---

## โครงสร้างของ Strategy Interface

### วิธีการหลัก (Core Methods)

#### 1. calculate(data)
- **หน้าที่**: ดำเนินการคำนวณค่าไฟฟ้าตามข้อมูลที่ได้รับ
- **พารามิเตอร์**: `data` - ข้อมูลการใช้งานไฟฟ้า
- **ผลลัพธ์**: วัตถุที่ประกอบด้วยผลการคำนวณค่าไฟฟ้า

#### 2. getProvider()
- **หน้าที่**: คืนค่าชื่อผู้ให้บริการ (MEA หรือ PEA)
- **ผลลัพธ์**: String ("MEA" หรือ "PEA")

#### 3. getCalculationType()
- **หน้าที่**: คืนค่าประเภทการคำนวณ
- **ผลลัพธ์**: String (เช่น "2.2.1", "3.1.1", "4.1.1", "5.1.1")

#### 4. getTariffModel()
- **หน้าที่**: คืนค่ารูปแบบการคิดค่าไฟฟ้า
- **ผลลัพธ์**: String ("normal", "tou", "tod")

#### 5. getVoltageLevel()
- **หน้าที่**: คืนค่าระดับแรงดันไฟฟ้า
- **ผลลัพธ์**: String (เช่น "<12kV", ">=69kV")

#### 6. getCustomerSize()
- **หน้าที่**: คืนค่าขนาดลูกค้า
- **ผลลัพธ์**: String ("small", "medium", "large", "specific")

### วิธีการตรวจสอบข้อมูล (Validation Methods)

#### 1. validateInput(data)
- ตรวจสอบข้อมูลพื้นฐานที่จำเป็น
- ตรวจสอบความถูกต้องของ tariffType และ voltageLevel
- เรียกใช้ validateOtherFields และ validateUsageFields

#### 2. validateOtherFields(data)
- ตรวจสอบฟิลด์ที่ใช้ร่วมกันทุก Strategy
- ตรวจสอบ ftRateSatang (จำเป็นสำหรับทุกประเภท)
- ตรวจสอบ peakKvar และ highestDemandChargeLast12m (สำหรับ Type 3, 4, 5)

#### 3. validateUsageFields(data)
- ตรวจสอบฟิลด์การใช้งานตามประเภทการคำนวณ
- Type 2: ตรวจสอบ total_kwh หรือ on_peak_kwh/off_peak_kwh
- Type 3, 5: ตรวจสอบ peak_kw และ total_kwh
- Type 4: ตรวจสอบ on_peak_kw, partial_peak_kw, off_peak_kw

---

## Dynamic Strategy Factory และการจัดการ

### 1. File System Discovery

Dynamic Strategy Factory ใช้ File System Discovery เพื่อค้นหา Strategy Files อัตโนมัติ:

```javascript
function getAvailableStrategyFiles() {
  const strategiesDir = __dirname;
  const files = fs.readdirSync(strategiesDir);
  
  // กรองเฉพาะไฟล์ .js ที่เป็น Strategy
  const strategyFiles = files
    .filter(file => {
      return file.endsWith('.js') && 
             file !== 'StrategyFactory.js' && 
             file !== 'ICalculationStrategy.js' &&
             file !== 'shared-calculation-utils.js';
    })
    .map(file => file.replace('.js', '')); // ลบ .js extension
    
  return strategyFiles;
}
```

### 2. Dynamic Loading System

```javascript
function loadStrategyClass(strategyFileName) {
  // ตรวจสอบ cache ก่อน
  if (strategyCache.has(strategyFileName)) {
    return strategyCache.get(strategyFileName);
  }

  // โหลด Strategy แบบ dynamic
  const strategyPath = path.join(__dirname, `${strategyFileName}.js`);
  const StrategyClass = require(strategyPath);
  
  // เก็บใน cache
  strategyCache.set(strategyFileName, StrategyClass);
  
  return StrategyClass;
}
```

### 3. การสร้าง Strategy (แบบใหม่)

```javascript
function createStrategy(tariffPlanName) {
  // 1. ตรวจสอบว่า tariff plan มีอยู่จริง
  // 2. โหลด Strategy Class แบบ dynamic
  // 3. สร้างและคืนค่า Strategy Instance
}
```

### 4. Strategy Caching

ระบบใช้ Map เพื่อ cache Strategy Classes ที่โหลดแล้ว:

```javascript
const strategyCache = new Map();

// ตรวจสอบ cache ก่อนโหลดใหม่
if (strategyCache.has(strategyFileName)) {
  return strategyCache.get(strategyFileName);
}
```

### 5. การค้นหา Strategy

```javascript
// ค้นหา Strategy ทั้งหมด
function getAllStrategies() {
  return getAvailableStrategyFiles();
}

// ค้นหา Strategy ตาม Provider
function getStrategiesByProvider(provider) {
  const allStrategies = getAvailableStrategyFiles();
  return allStrategies.filter(strategy => strategy.startsWith(provider));
}

// ค้นหา Strategy ตาม Calculation Type
function getStrategiesByCalculationType(calculationType) {
  const allStrategies = getAvailableStrategyFiles();
  return allStrategies.filter(strategy => strategy.includes(`_${baseType}.`));
}
```

---

## การใช้งาน Strategies แต่ละประเภท

### 1. Type 2 Strategies (Small Customers)

#### MEA_2.2.1_small_TOU
```javascript
class MEA_2_2_1_small_TOU extends ICalculationStrategy {
  constructor() {
    const rates = {
      serviceCharge: 33.29,
      onPeakRate: 5.7982,
      offPeakRate: 2.6369
    };
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '2.2.1'; }
  getTariffModel() { return 'tou'; }
  getVoltageLevel() { return '<12kV'; }
  getCustomerSize() { return 'small'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-2');
    
    const serviceCharge = calculateServiceCharge(this.rates.serviceCharge);
    const energyCharge = calculateTOUCharge(
      normalizedUsage.onPeakKwh,
      normalizedUsage.offPeakKwh,
      this.rates.onPeakRate,
      this.rates.offPeakRate
    );
    
    return calculateSimpleBill({
      energyCharge,
      serviceCharge,
      ftRateSatang,
      totalKwh: normalizedUsage.totalKwh
    });
  }
}
```

#### PEA_2.2.1_small_TOU
```javascript
class PEA_2_2_1_small_TOU extends ICalculationStrategy {
  constructor() {
    const rates = {
      serviceCharge: 33.29,
      onPeakRate: 5.7982,
      offPeakRate: 2.6369
    };
    super(rates);
  }

  getProvider() { return 'PEA'; }
  getCalculationType() { return '2.2.1'; }
  getTariffModel() { return 'tou'; }
  getVoltageLevel() { return '<22kV'; }
  getCustomerSize() { return 'small'; }

  // calculate method เหมือนกับ MEA_2.2.1_small_TOU
}
```

### 2. Type 3 Strategies (Medium Customers)

#### MEA_3.1.1_medium_normal
```javascript
class MEA_3_1_1_medium_normal extends ICalculationStrategy {
  constructor() {
    const rates = {
      demand: 175.7,
      energy: 3.1097
    };
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '3.1.1'; }
  getTariffModel() { return 'normal'; }
  getVoltageLevel() { return '>=69kV'; }
  getCustomerSize() { return 'medium'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-3');
    
    const demandCharge = calculateBasicDemandCharge(normalizedUsage.overallPeakKw, this.rates.demand);
    const energyCharge = calculateBasicEnergyCharge(normalizedUsage.totalKwh, this.rates.energy);
    const serviceCharge = calculateServiceCharge(312.24);
    
    return calculateCompleteBill({
      energyCharge,
      demandCharge,
      serviceCharge,
      ftRateSatang,
      totalKwh: normalizedUsage.totalKwh,
      peakKvar,
      overallPeakKw: normalizedUsage.overallPeakKw,
      highestDemandChargeLast12m
    });
  }
}
```

### 3. Type 4 Strategies (Large Customers)

#### MEA_4.1.1_large_TOD
```javascript
class MEA_4_1_1_large_TOD extends ICalculationStrategy {
  constructor() {
    const rates = {
      demand_on: 280,
      demand_partial: 74.14,
      demand_off: 0,
      energy: 3.1097
    };
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '4.1.1'; }
  getTariffModel() { return 'tod'; }
  getVoltageLevel() { return '>=69kV'; }
  getCustomerSize() { return 'large'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-4');
    
    const demandCharge = calculateTODDemandCharge(
      usage.on_peak_kw,
      usage.partial_peak_kw,
      usage.off_peak_kw,
      this.rates.demand_on,
      this.rates.demand_partial,
      this.rates.demand_off
    );
    const energyCharge = calculateBasicEnergyCharge(normalizedUsage.totalKwh, this.rates.energy);
    const serviceCharge = calculateServiceCharge(312.24);
    
    return calculateCompleteBill({
      energyCharge,
      demandCharge,
      serviceCharge,
      ftRateSatang,
      totalKwh: normalizedUsage.totalKwh,
      peakKvar,
      overallPeakKw: normalizedUsage.overallPeakKw,
      highestDemandChargeLast12m
    });
  }
}
```

### 4. Type 5 Strategies (Specific Customers)

#### MEA_5.1.1_specific_normal
```javascript
class MEA_5_1_1_specific_normal extends ICalculationStrategy {
  constructor() {
    const rates = {
      demand: 220.36,
      energy: 3.1097
    };
    super(rates);
  }

  getProvider() { return 'MEA'; }
  getCalculationType() { return '5.1.1'; }
  getTariffModel() { return 'normal'; }
  getVoltageLevel() { return '>=69kV'; }
  getCustomerSize() { return 'specific'; }

  calculate(data) {
    this.validateInput(data);
    
    const { ftRateSatang, peakKvar, highestDemandChargeLast12m, usage } = data;
    const normalizedUsage = normalizeUsageData(usage, 'type-3');
    
    const demandCharge = calculateBasicDemandCharge(normalizedUsage.overallPeakKw, this.rates.demand);
    const energyCharge = calculateBasicEnergyCharge(normalizedUsage.totalKwh, this.rates.energy);
    const serviceCharge = calculateServiceCharge(312.24);
    
    return calculateCompleteBill({
      energyCharge,
      demandCharge,
      serviceCharge,
      ftRateSatang,
      totalKwh: normalizedUsage.totalKwh,
      peakKvar,
      overallPeakKw: normalizedUsage.overallPeakKw,
      highestDemandChargeLast12m
    });
  }
}
```

---

## ตัวอย่างการใช้งานแบบละเอียด

### 1. การใช้งานผ่าน Controller

#### ElectricityController.calculateBill()
```javascript
async calculateBill(ctx) {
  try {
    const { provider, calculationType } = ctx.params;
    const data = ctx.request.body;

    // ตรวจสอบพารามิเตอร์ที่จำเป็น
    if (!provider || !calculationType) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Provider and calculation type are required',
        timestamp: new Date().toISOString()
      };
      return;
    }

    // เรียกใช้ Service เพื่อคำนวณ
    const result = electricityService.calculateBill(provider, calculationType, data);

    ctx.status = 200;
    ctx.body = {
      success: true,
      data: result,
      metadata: {
        provider,
        calculationType,
        tariffType: data.tariffType,
        voltageLevel: data.voltageLevel,
        serviceVersion: '3.0.0',
        strategyPattern: 'strategy'
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Calculation request failed', {
      provider: ctx.params.provider,
      calculationType: ctx.params.calculationType,
      error: error.message
    });

    ctx.status = 400;
    ctx.body = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

### 2. การใช้งานผ่าน Service

#### ElectricityService.calculateBill()
```javascript
calculateBill(provider, calculationType, data) {
  try {
    // ตรวจสอบข้อมูลนำเข้า
    this._validateInput(provider, calculationType, data);

    const { tariffType, voltageLevel } = data;

    // สร้าง Strategy ที่เหมาะสมโดยใช้ Factory
    const strategy = createStrategy(provider, calculationType, tariffType, voltageLevel);

    // ดำเนินการคำนวณโดยใช้ Strategy
    const result = strategy.calculate(data);

    // บันทึก log การคำนวณที่สำเร็จ
    logger.info('Calculation completed successfully', {
      provider,
      calculationType,
      tariffType,
      voltageLevel,
      strategyId: strategy.getStrategyId(),
      description: strategy.getDescription()
    });

    return result;

  } catch (error) {
    logger.error('Calculation failed', {
      provider,
      calculationType,
      tariffType: data?.tariffType,
      voltageLevel: data?.voltageLevel,
      error: error.message
    });
    throw error;
  }
}
```

### 3. ตัวอย่างการเรียกใช้ API

#### ตัวอย่างที่ 1: MEA Type 2 Small TOU
```bash
POST /api/electricity/calculate/MEA/type-2
Content-Type: application/json

{
  "tariffType": "tou",
  "voltageLevel": "<12kV",
  "ftRateSatang": 0.5,
  "usage": {
    "on_peak_kwh": 100,
    "off_peak_kwh": 200
  }
}
```

**ผลลัพธ์:**
```json
{
  "success": true,
  "data": {
    "energyCharge": 1102.5,
    "serviceCharge": 33.29,
    "baseTariff": 1135.79,
    "ftCharge": 1.5,
    "vat": 79.65,
    "totalBill": 1216.94
  },
  "metadata": {
    "provider": "MEA",
    "calculationType": "type-2",
    "tariffType": "tou",
    "voltageLevel": "<12kV",
    "serviceVersion": "3.0.0",
    "strategyPattern": "strategy"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### ตัวอย่างที่ 2: PEA Type 3 Medium Normal
```bash
POST /api/electricity/calculate/PEA/type-3
Content-Type: application/json

{
  "tariffType": "normal",
  "voltageLevel": ">=69kV",
  "ftRateSatang": 0.5,
  "peakKvar": 50,
  "highestDemandChargeLast12m": 10000,
  "usage": {
    "peak_kw": 100,
    "total_kwh": 5000
  }
}
```

**ผลลัพธ์:**
```json
{
  "success": true,
  "data": {
    "calculatedDemandCharge": 17570,
    "energyCharge": 15548.5,
    "effectiveDemandCharge": 17570,
    "pfCharge": 0,
    "serviceCharge": 312.24,
    "ftCharge": 25,
    "subTotal": 33455.74,
    "vat": 2341.9,
    "grandTotal": 35797.64
  },
  "metadata": {
    "provider": "PEA",
    "calculationType": "type-3",
    "tariffType": "normal",
    "voltageLevel": ">=69kV",
    "serviceVersion": "3.0.0",
    "strategyPattern": "strategy"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### ตัวอย่างที่ 3: MEA Type 4 Large TOD
```bash
POST /api/electricity/calculate/MEA/type-4
Content-Type: application/json

{
  "tariffType": "tod",
  "voltageLevel": ">=69kV",
  "ftRateSatang": 0.5,
  "peakKvar": 100,
  "highestDemandChargeLast12m": 20000,
  "usage": {
    "on_peak_kw": 150,
    "partial_peak_kw": 100,
    "off_peak_kw": 50,
    "total_kwh": 10000
  }
}
```

**ผลลัพธ์:**
```json
{
  "success": true,
  "data": {
    "calculatedDemandCharge": 48140,
    "energyCharge": 31097,
    "effectiveDemandCharge": 48140,
    "pfCharge": 0,
    "serviceCharge": 312.24,
    "ftCharge": 50,
    "subTotal": 79599.24,
    "vat": 5571.95,
    "grandTotal": 85171.19
  },
  "metadata": {
    "provider": "MEA",
    "calculationType": "type-4",
    "tariffType": "tod",
    "voltageLevel": ">=69kV",
    "serviceVersion": "3.0.0",
    "strategyPattern": "strategy"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. การใช้งาน Factory Methods

#### การดึงข้อมูล Strategy ที่มีอยู่
```javascript
// ดึงข้อมูล Strategy ทั้งหมด
const allStrategies = getAllStrategies();
console.log('All strategies:', allStrategies);

// ดึงข้อมูล Strategy ของ MEA
const meaStrategies = getStrategiesByProvider('MEA');
console.log('MEA strategies:', meaStrategies);

// ดึงข้อมูล Strategy ของ Type 3
const type3Strategies = getStrategiesByCalculationType('type-3');
console.log('Type 3 strategies:', type3Strategies);

// ตรวจสอบว่าการรวมกันของพารามิเตอร์ได้รับการสนับสนุนหรือไม่
const isSupported = isCombinationSupported('MEA', 'type-2', 'tou', '<12kV');
console.log('Is combination supported:', isSupported);
```

### 5. การจัดการข้อผิดพลาด

#### ตัวอย่างการจัดการข้อผิดพลาดใน Strategy
```javascript
calculate(data) {
  try {
    // ตรวจสอบข้อมูลนำเข้า
    this.validateInput(data);
    
    // ดำเนินการคำนวณ
    const result = this.performCalculation(data);
    
    return result;
    
  } catch (error) {
    // บันทึก log ข้อผิดพลาด
    logger.error('Strategy calculation failed', {
      strategyId: this.getStrategyId(),
      error: error.message,
      data: data
    });
    
    // ส่งต่อข้อผิดพลาด
    throw error;
  }
}
```

#### ตัวอย่างการจัดการข้อผิดพลาดใน Factory
```javascript
function createStrategy(provider, calculationType, tariffType, voltageLevel) {
  try {
    // ตรวจสอบพารามิเตอร์
    if (!provider || !calculationType || !tariffType || !voltageLevel) {
      throw new Error('All parameters are required');
    }

    // สร้าง Strategy ID
    const strategyId = buildStrategyId(provider, calculationType, tariffType, voltageLevel);
    
    // ค้นหา Strategy Class
    const StrategyClass = STRATEGY_REGISTRY[strategyId];
    if (!StrategyClass) {
      throw new Error(`Strategy not found: ${strategyId}`);
    }

    // สร้างและคืนค่า Strategy Instance
    const strategy = new StrategyClass();
    
    logger.debug('Strategy created successfully', {
      strategyId,
      provider,
      calculationType,
      tariffType,
      voltageLevel
    });

    return strategy;

  } catch (error) {
    logger.error('Failed to create strategy', {
      provider,
      calculationType,
      tariffType,
      voltageLevel,
      error: error.message
    });
    throw error;
  }
}
```

---

## การทดสอบและตรวจสอบ

### 1. การทดสอบ Strategy แต่ละตัว

#### ตัวอย่างการทดสอบ MEA_2.2.1_small_TOU
```javascript
describe('MEA_2.2.1_small_TOU Strategy', () => {
  let strategy;

  beforeEach(() => {
    strategy = new MEA_2_2_1_small_TOU();
  });

  it('should return correct provider information', () => {
    expect(strategy.getProvider()).toBe('MEA');
    expect(strategy.getCalculationType()).toBe('2.2.1');
    expect(strategy.getTariffModel()).toBe('tou');
    expect(strategy.getVoltageLevel()).toBe('<12kV');
    expect(strategy.getCustomerSize()).toBe('small');
  });

  it('should calculate bill correctly for TOU tariff', () => {
    const data = {
      tariffType: 'tou',
      voltageLevel: '<12kV',
      ftRateSatang: 0.5,
      usage: {
        on_peak_kwh: 100,
        off_peak_kwh: 200
      }
    };

    const result = strategy.calculate(data);

    expect(result.energyCharge).toBe(1102.5);
    expect(result.serviceCharge).toBe(33.29);
    expect(result.baseTariff).toBe(1135.79);
    expect(result.ftCharge).toBe(1.5);
    expect(result.vat).toBe(79.65);
    expect(result.totalBill).toBe(1216.94);
  });

  it('should validate input data correctly', () => {
    const validData = {
      tariffType: 'tou',
      voltageLevel: '<12kV',
      ftRateSatang: 0.5,
      usage: {
        on_peak_kwh: 100,
        off_peak_kwh: 200
      }
    };

    expect(() => strategy.validateInput(validData)).not.toThrow();
  });

  it('should throw error for invalid input data', () => {
    const invalidData = {
      tariffType: 'normal', // ผิด tariff type
      voltageLevel: '<12kV',
      ftRateSatang: 0.5,
      usage: {
        on_peak_kwh: 100,
        off_peak_kwh: 200
      }
    };

    expect(() => strategy.validateInput(invalidData)).toThrow('Tariff type mismatch');
  });
});
```

### 2. การทดสอบ Factory

#### ตัวอย่างการทดสอบ StrategyFactory
```javascript
describe('StrategyFactory', () => {
  it('should create correct strategy for MEA type-2 tou <12kV', () => {
    const strategy = createStrategy('MEA', 'type-2', 'tou', '<12kV');
    
    expect(strategy).toBeInstanceOf(MEA_2_2_1_small_TOU);
    expect(strategy.getProvider()).toBe('MEA');
    expect(strategy.getCalculationType()).toBe('2.2.1');
    expect(strategy.getTariffModel()).toBe('tou');
    expect(strategy.getVoltageLevel()).toBe('<12kV');
  });

  it('should create correct strategy for PEA type-3 normal >=69kV', () => {
    const strategy = createStrategy('PEA', 'type-3', 'normal', '>=69kV');
    
    expect(strategy).toBeInstanceOf(PEA_3_1_1_medium_normal);
    expect(strategy.getProvider()).toBe('PEA');
    expect(strategy.getCalculationType()).toBe('3.1.1');
    expect(strategy.getTariffModel()).toBe('normal');
    expect(strategy.getVoltageLevel()).toBe('>=69kV');
  });

  it('should throw error for unsupported combination', () => {
    expect(() => {
      createStrategy('MEA', 'type-2', 'normal', '<12kV');
    }).toThrow('Strategy not found');
  });

  it('should return all available strategies', () => {
    const allStrategies = getAllStrategies();
    
    expect(allStrategies).toHaveLength(30);
    expect(allStrategies).toContain('MEA_2.2.1_small_TOU');
    expect(allStrategies).toContain('PEA_3.1.1_medium_normal');
  });

  it('should return strategies by provider', () => {
    const meaStrategies = getStrategiesByProvider('MEA');
    const peaStrategies = getStrategiesByProvider('PEA');
    
    expect(meaStrategies).toHaveLength(15);
    expect(peaStrategies).toHaveLength(15);
    
    meaStrategies.forEach(strategy => {
      expect(strategy).toMatch(/^MEA_/);
    });
    
    peaStrategies.forEach(strategy => {
      expect(strategy).toMatch(/^PEA_/);
    });
  });

  it('should return strategies by calculation type', () => {
    const type2Strategies = getStrategiesByCalculationType('type-2');
    const type3Strategies = getStrategiesByCalculationType('type-3');
    
    expect(type2Strategies).toHaveLength(4); // 2 MEA + 2 PEA
    expect(type3Strategies).toHaveLength(6); // 3 MEA + 3 PEA
    
    type2Strategies.forEach(strategy => {
      expect(strategy).toMatch(/2\.2\./);
    });
    
    type3Strategies.forEach(strategy => {
      expect(strategy).toMatch(/3\./);
    });
  });

  it('should validate combination support correctly', () => {
    expect(isCombinationSupported('MEA', 'type-2', 'tou', '<12kV')).toBe(true);
    expect(isCombinationSupported('PEA', 'type-3', 'normal', '>=69kV')).toBe(true);
    expect(isCombinationSupported('MEA', 'type-2', 'normal', '<12kV')).toBe(false);
    expect(isCombinationSupported('INVALID', 'type-2', 'tou', '<12kV')).toBe(false);
  });
});
```

### 3. การทดสอบ Integration

#### ตัวอย่างการทดสอบ Integration
```javascript
describe('Electricity Service Integration', () => {
  let electricityService;

  beforeEach(() => {
    electricityService = new ElectricityService();
  });

  it('should calculate MEA type-2 bill correctly', async () => {
    const data = {
      tariffType: 'tou',
      voltageLevel: '<12kV',
      ftRateSatang: 0.5,
      usage: {
        on_peak_kwh: 100,
        off_peak_kwh: 200
      }
    };

    const result = electricityService.calculateBill('MEA', 'type-2', data);

    expect(result.energyCharge).toBe(1102.5);
    expect(result.serviceCharge).toBe(33.29);
    expect(result.totalBill).toBe(1216.94);
  });

  it('should calculate PEA type-3 bill correctly', async () => {
    const data = {
      tariffType: 'normal',
      voltageLevel: '>=69kV',
      ftRateSatang: 0.5,
      peakKvar: 50,
      highestDemandChargeLast12m: 10000,
      usage: {
        peak_kw: 100,
        total_kwh: 5000
      }
    };

    const result = electricityService.calculateBill('PEA', 'type-3', data);

    expect(result.calculatedDemandCharge).toBe(17570);
    expect(result.energyCharge).toBe(15548.5);
    expect(result.grandTotal).toBe(35797.64);
  });

  it('should throw error for invalid input', async () => {
    const invalidData = {
      tariffType: 'invalid',
      voltageLevel: '<12kV',
      ftRateSatang: 0.5,
      usage: {
        on_peak_kwh: 100,
        off_peak_kwh: 200
      }
    };

    expect(() => {
      electricityService.calculateBill('MEA', 'type-2', invalidData);
    }).toThrow('Invalid tariff type');
  });
});
```

**เวอร์ชัน**: 3.0.0  
**ผู้จัดทำ**: BGRIM Energy Platform Development Team
