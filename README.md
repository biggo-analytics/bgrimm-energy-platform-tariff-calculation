# Koa Electricity Bill API

A comprehensive Node.js backend API built with Koa.js for calculating electricity bills based on different tariff types and customer categories. This API provides accurate bill calculations for various electricity service types used by utility companies.

## Description

This project implements a scalable and maintainable backend service that calculates electricity bills for different customer types (Type 2-5) with support for various tariff structures including normal, time-of-use (TOU), and time-of-day (TOD) pricing. The API is designed with a clean architecture pattern, separating concerns between routes, controllers, and services.

## Prerequisites

- Node.js (version 14.0.0 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd koa-electricity-bill-api
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default. You can change the port by setting the `PORT` environment variable.

## API Documentation

### Base URL
```
http://localhost:3000
```

### 1. Health Check API

**Method:** `GET`  
**URL:** `/health`  
**Description:** Simple health check endpoint to verify the API is running.

**Sample Success Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-20T10:45:10.000Z"
}
```

### 2. API Information

**Method:** `GET`  
**URL:** `/api/info`  
**Description:** Returns basic information about the API project.

**Sample Success Response:**
```json
{
  "projectName": "Koa Electricity Bill API",
  "version": "1.0.0",
  "framework": "Koa.js"
}
```

### 3. Type 2 - Small General Service

**Method:** `POST`  
**URL:** `/api/mea/calculate/type-2`  
**Description:** Calculates electricity bill for "Type 2: Small General Service" customers.

**Sample Request Body:**
```json
{
  "tariffType": "normal",
  "voltageLevel": "<12kV",
  "ftRateSatang": 39.72,
  "usage": {
    "total_kwh": 500
  }
}
```

**Sample Success Response:**
```json
{
  "energyCharge": 1852.565,
  "serviceCharge": 33.29,
  "baseTariff": 1885.855,
  "ftCharge": 198.6,
  "vat": 145.91185,
  "totalBill": 2230.36685
}
```

**Notes:**
- `tariffType`: Must be either "normal" or "tou"
- `voltageLevel`: Must be either "<12kV" or "12-24kV"
- For TOU tariff type, use `on_peak_kwh` and `off_peak_kwh` in the usage object

### 4. Type 3 - Medium General Service

**Method:** `POST`  
**URL:** `/api/mea/calculate/type-3`  
**Description:** Calculates electricity bill for "Type 3: Medium General Service" customers.

**Sample Request Body:**
```json
{
  "tariffType": "normal",
  "voltageLevel": ">=69kV",
  "ftRateSatang": 39.72,
  "peakKvar": 120,
  "highestDemandChargeLast12m": 20000.00,
  "usage": {
    "peak_kw": 100,
    "total_kwh": 40000
  }
}
```

**Sample Success Response:**
```json
{
  "calculatedDemandCharge": 17570,
  "energyCharge": 124388,
  "effectiveDemandCharge": 17570,
  "pfCharge": 3252.063,
  "serviceCharge": 312.24,
  "ftCharge": 15888,
  "subTotal": 161410.303,
  "vat": 11298.72121,
  "grandTotal": 172709.02421
}
```

**Notes:**
- `tariffType`: Must be either "normal" or "tou"
- `voltageLevel`: Must be one of "<12kV", "12-24kV", or ">=69kV"
- For TOU tariff type, use `on_peak_kw`, `on_peak_kwh`, `off_peak_kw`, and `off_peak_kwh` in the usage object

### 5. Type 4 - Large General Service

**Method:** `POST`  
**URL:** `/api/mea/calculate/type-4`  
**Description:** Calculates electricity bill for "Type 4: Large General Service" customers.

**Sample Request Body:**
```json
{
  "tariffType": "tod",
  "voltageLevel": "12-24kV",
  "ftRateSatang": 39.72,
  "peakKvar": 150,
  "highestDemandChargeLast12m": 50000.00,
  "usage": {
    "on_peak_kw": 200,
    "partial_peak_kw": 180,
    "off_peak_kw": 50,
    "total_kwh": 80000
  }
}
```

**Sample Success Response:**
```json
{
  "calculatedDemandCharge": 90795.4,
  "energyCharge": 250168,
  "effectiveDemandCharge": 90795.4,
  "pfCharge": 1457.823,
  "serviceCharge": 312.24,
  "ftCharge": 31776,
  "subTotal": 374509.463,
  "vat": 26215.66241,
  "grandTotal": 400725.12541
}
```

**Notes:**
- `tariffType`: Must be either "tod" or "tou"
- `voltageLevel`: Must be one of "<12kV", "12-24kV", or ">=69kV"
- For TOD tariff type, use `on_peak_kw`, `partial_peak_kw`, `off_peak_kw`, and `total_kwh`
- For TOU tariff type, use `on_peak_kw`, `on_peak_kwh`, `off_peak_kw`, and `off_peak_kwh`

### 6. Type 5 - Specific Business

**Method:** `POST`  
**URL:** `/api/mea/calculate/type-5`  
**Description:** Calculates electricity bill for "Type 5: Specific Business" customers.

**Sample Request Body:**
```json
{
  "tariffType": "normal",
  "voltageLevel": "<12kV",
  "ftRateSatang": 39.72,
  "peakKvar": 100,
  "highestDemandChargeLast12m": 25000.00,
  "usage": {
    "peak_kw": 110,
    "total_kwh": 45000
  }
}
```

**Sample Success Response:**
```json
{
  "calculatedDemandCharge": 30430.4,
  "energyCharge": 142879.5,
  "effectiveDemandCharge": 30430.4,
  "pfCharge": 1794.243,
  "serviceCharge": 312.24,
  "ftCharge": 17874,
  "subTotal": 193290.383,
  "vat": 13530.32681,
  "grandTotal": 206820.70981
}
```

**Notes:**
- `tariffType`: Must be either "normal" or "tou"
- `voltageLevel`: Must be one of "<12kV", "12-24kV", or ">=69kV"
- For TOU tariff type, use `on_peak_kw`, `on_peak_kwh`, `off_peak_kw`, and `off_peak_kwh` in the usage object

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input data or missing required fields
- `500 Internal Server Error`: Server-side errors

**Sample Error Response:**
```json
{
  "error": "Missing required field: tariffType",
  "timestamp": "2025-08-20T10:45:10.000Z"
}
```

## Project Structure

```
src/
├── app.js                 # Main application entry point
├── routes/
│   ├── index.js          # Main router aggregator
│   └── api.routes.js     # API route definitions
├── controllers/
│   ├── health.controller.js    # Health check controller
│   └── electricity.controller.js # Electricity calculation controller
└── services/
    └── electricity.service.js   # Business logic for calculations
```

## Features

- **Clean Architecture**: Separation of concerns with routes, controllers, and services
- **Input Validation**: Comprehensive validation for all API endpoints
- **Error Handling**: Proper error handling with meaningful error messages
- **Logging**: Request logging middleware for monitoring
- **Scalable Design**: Easy to extend with new calculation types
- **Type Safety**: Well-structured data validation and type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
