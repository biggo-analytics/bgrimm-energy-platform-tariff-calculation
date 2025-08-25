# API v2 Documentation - Strategy Pattern Implementation

## Overview

API v2 introduces a redesigned electricity tariff calculation system using the **Strategy Pattern** design pattern. This new version provides enhanced functionality, better error handling, and improved extensibility while maintaining full backward compatibility.

## Architecture Improvements

### Strategy Pattern Benefits
- **Eliminated Complex Conditionals**: Replaced nested if/else statements with clean strategy classes
- **Enhanced Maintainability**: Each tariff type is handled by its own strategy class
- **Improved Extensibility**: Easy to add new tariff types without modifying existing code
- **Better Testability**: Individual strategies can be tested in isolation
- **Cleaner Code Organization**: Clear separation of concerns

### Key Features
- ✅ **Enhanced Error Handling**: More descriptive error messages and proper error codes
- ✅ **Service Discovery**: APIs to discover available tariff types and configurations
- ✅ **Rate Information**: Endpoints to retrieve rate configurations
- ✅ **Validation**: Improved input validation with detailed error messages
- ✅ **Backward Compatibility**: Original v1 API remains fully functional

## Base URL

```
https://your-domain.com/api/v2
```

## Authentication

Currently no authentication required. Future versions may include API key authentication.

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "field": "fieldName", // Optional: specific field that caused the error
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## API Information Endpoints

### Get API Health Status
```http
GET /api/v2/health
```

**Response:**
```json
{
  "success": true,
  "message": "Strategy Pattern API is healthy",
  "version": "2.0.0",
  "features": [
    "Strategy Pattern Implementation",
    "Enhanced Error Handling",
    "Service Information APIs",
    "Rate Information APIs",
    "Tariff Type Discovery"
  ],
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Get API Information
```http
GET /api/v2/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "2.0.0",
    "description": "Enhanced Electricity Tariff Calculation API with Strategy Pattern",
    "providers": ["MEA", "PEA"],
    "calculationTypes": ["type-2", "type-3", "type-4", "type-5"],
    "tariffTypes": ["normal", "tou", "tod"],
    "features": {
      "strategyPattern": true,
      "enhancedValidation": true,
      "serviceDiscovery": true,
      "rateInformation": true,
      "errorHandling": "Enhanced"
    },
    "endpoints": {
      "mea": {
        "calculate": "/api/v2/mea/calculate/{type}",
        "info": "/api/v2/mea/info",
        "rates": "/api/v2/mea/rates",
        "tariffTypes": "/api/v2/mea/tariff-types/{calculationType}"
      },
      "pea": {
        "calculate": "/api/v2/pea/calculate/{type}",
        "info": "/api/v2/pea/info",
        "rates": "/api/v2/pea/rates",
        "tariffTypes": "/api/v2/pea/tariff-types/{calculationType}"
      }
    }
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Compare API Versions
```http
GET /api/v2/compare
```

**Response:**
```json
{
  "success": true,
  "data": {
    "v1": {
      "endpoint": "/api",
      "description": "Original implementation",
      "features": ["Basic calculations", "Legacy architecture"]
    },
    "v2": {
      "endpoint": "/api/v2",
      "description": "Strategy Pattern implementation",
      "features": [
        "Strategy Pattern architecture",
        "Enhanced error handling",
        "Service discovery APIs",
        "Rate information APIs",
        "Better validation",
        "Improved extensibility"
      ]
    },
    "migration": {
      "status": "Available",
      "recommendation": "Use v2 for new integrations",
      "note": "v1 remains available for backward compatibility"
    }
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## MEA (Metropolitan Electricity Authority) Endpoints

### MEA Service Information
```http
GET /api/v2/mea/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "MEA",
    "providerName": "Metropolitan Electricity Authority",
    "supportedCalculationTypes": ["type-2", "type-3", "type-4", "type-5"],
    "supportedTariffTypes": ["normal", "tou", "tod"],
    "tariffTypesPerCalculationType": {
      "type-2": ["normal", "tou"],
      "type-3": ["normal", "tou"],
      "type-4": ["tod", "tou"],
      "type-5": ["normal", "tou"]
    },
    "validVoltageLevels": ["<12kV", "12-24kV", ">=69kV"],
    "serviceCharge": 312.24
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Get Available Tariff Types
```http
GET /api/v2/mea/tariff-types/{calculationType}
```

**Path Parameters:**
- `calculationType`: One of `type-2`, `type-3`, `type-4`, `type-5`

**Response:**
```json
{
  "success": true,
  "data": {
    "calculationType": "type-2",
    "availableTariffTypes": ["normal", "tou"]
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Get Rate Information
```http
GET /api/v2/mea/rates?calculationType={type}&tariffType={tariff}&voltageLevel={voltage}
```

**Query Parameters:**
- `calculationType`: Calculation type (required)
- `tariffType`: Tariff type (required)
- `voltageLevel`: Voltage level (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "MEA",
    "calculationType": "type-2",
    "tariffType": "normal",
    "voltageLevel": "<12kV",
    "rates": {
      "serviceCharge": 33.29,
      "energyRates": [
        { "threshold": 0, "rate": 3.2484 },
        { "threshold": 150, "rate": 4.2218 },
        { "threshold": 400, "rate": 4.4217 }
      ]
    },
    "serviceCharge": 33.29
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### MEA Calculations

#### Type 2 - Small General Service
```http
POST /api/v2/mea/calculate/type-2
```

**Request Body:**
```json
{
  "tariffType": "normal", // or "tou"
  "voltageLevel": "<12kV", // or "12-24kV"
  "ftRateSatang": 19.72,
  "usage": {
    "total_kwh": 500 // for normal tariff
    // OR for TOU tariff:
    // "on_peak_kwh": 300,
    // "off_peak_kwh": 200
  }
}
```

**Response:**
```json
{
  "success": true,
  "energyCharge": 1984.88,
  "serviceCharge": 33.29,
  "baseTariff": 2018.17,
  "ftCharge": 98.6,
  "vat": 148.1739,
  "totalBill": 2264.9439,
  "provider": "mea",
  "calculationType": "type-2",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### Type 3 - Medium General Service
```http
POST /api/v2/mea/calculate/type-3
```

**Request Body:**
```json
{
  "tariffType": "normal", // or "tou"
  "voltageLevel": ">=69kV", // "12-24kV", or "<12kV"
  "ftRateSatang": 19.72,
  "peakKvar": 100,
  "highestDemandChargeLast12m": 1000,
  "usage": {
    // For normal tariff:
    "total_kwh": 2000,
    "peak_kw": 150
    // OR for TOU tariff:
    // "on_peak_kwh": 1200,
    // "off_peak_kwh": 800,
    // "on_peak_kw": 180,
    // "off_peak_kw": 120
  }
}
```

**Response:**
```json
{
  "success": true,
  "calculatedDemandCharge": 26355.0,
  "energyCharge": 6219.4,
  "effectiveDemandCharge": 26355.0,
  "pfCharge": 392.49,
  "serviceCharge": 312.24,
  "ftCharge": 394.4,
  "subTotal": 33673.53,
  "vat": 2357.1471,
  "grandTotal": 36030.6771,
  "provider": "mea",
  "calculationType": "type-3",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### Type 4 - Large General Service
```http
POST /api/v2/mea/calculate/type-4
```

**Request Body:**
```json
{
  "tariffType": "tod", // or "tou"
  "voltageLevel": ">=69kV",
  "ftRateSatang": 19.72,
  "peakKvar": 200,
  "highestDemandChargeLast12m": 2000,
  "usage": {
    // For TOD tariff:
    "total_kwh": 5000,
    "on_peak_kw": 300,
    "partial_peak_kw": 250,
    "off_peak_kw": 200
    // OR for TOU tariff:
    // "on_peak_kwh": 2000,
    // "off_peak_kwh": 3000,
    // "on_peak_kw": 250,
    // "off_peak_kw": 200
  }
}
```

#### Type 5 - Specific Business
```http
POST /api/v2/mea/calculate/type-5
```

**Request Body:** Similar to Type 3, but with `tariffType: "normal"` or `"tou"` only.

## PEA (Provincial Electricity Authority) Endpoints

PEA endpoints follow the same structure as MEA endpoints, but with different voltage levels and rate configurations:

### PEA Service Information
```http
GET /api/v2/pea/info
```

**Key Differences:**
- Valid voltage levels: `["<22kV", "22-33kV", ">=69kV"]`
- Service charge: Variable by rate configuration
- Different rate structures

### PEA Calculations
```http
POST /api/v2/pea/calculate/{type}
```

Same request/response format as MEA, but use PEA voltage levels (`<22kV`, `22-33kV`, `>=69kV`).

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "error": "Missing required field: voltageLevel",
  "field": "voltageLevel",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Invalid Tariff Type (400)
```json
{
  "success": false,
  "error": "Tariff type 'invalid' is not valid for type-2. Available types: normal, tou",
  "field": "tariffType",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Invalid Voltage Level (400)
```json
{
  "success": false,
  "error": "Invalid voltage level for Type 4 tod. Must be \">=69kV\", \"12-24kV\", or \"<12kV\", received: invalid",
  "field": "voltageLevel",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Calculation Error (400)
```json
{
  "success": false,
  "error": "Failed to calculate type-4: Type 4 does not support normal tariff. Use TOD or TOU tariff.",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Migration Guide

### From v1 to v2

1. **Update Base URL**: Change from `/api` to `/api/v2`
2. **Enhanced Error Responses**: Update error handling to use new error format
3. **New Discovery APIs**: Utilize service information and rate discovery endpoints
4. **Improved Validation**: Handle more detailed validation error messages

### Backward Compatibility

- **v1 API**: Remains fully functional at `/api` endpoints
- **Gradual Migration**: Migrate endpoints one by one
- **Feature Parity**: All v1 calculations work identically in v2
- **Performance**: v2 provides similar or better performance

## Rate Limits

Currently no rate limits are enforced. Future versions may include:
- API key authentication
- Rate limiting per key
- Request size limits

## Examples

### Complete MEA Type 2 Calculation
```bash
curl -X POST https://your-domain.com/api/v2/mea/calculate/type-2 \
  -H "Content-Type: application/json" \
  -d '{
    "tariffType": "normal",
    "voltageLevel": "<12kV",
    "ftRateSatang": 19.72,
    "usage": {
      "total_kwh": 500
    }
  }'
```

### Discover Available Tariff Types
```bash
curl https://your-domain.com/api/v2/mea/tariff-types/type-4
```

### Get Rate Information
```bash
curl "https://your-domain.com/api/v2/mea/rates?calculationType=type-2&tariffType=normal&voltageLevel=<12kV"
```

## Support

For technical support or questions about API v2:
- Review this documentation
- Check the `/api/v2/info` endpoint for current API status
- Use the `/api/v2/compare` endpoint to understand differences from v1

## Changelog

### v2.0.0 (Current)
- ✅ Implemented Strategy Pattern architecture
- ✅ Added service discovery APIs
- ✅ Enhanced error handling and validation
- ✅ Added rate information endpoints
- ✅ Improved API documentation
- ✅ Full backward compatibility maintained
