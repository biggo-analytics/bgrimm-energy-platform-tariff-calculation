# Architecture Documentation

## Overview

This project has been refactored to provide a systematic, standardized, and maintainable structure for electricity tariff calculations for both MEA (Metropolitan Electricity Authority) and PEA (Provincial Electricity Authority).

## Architecture Principles

### 1. Separation of Concerns
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and calculations
- **Utilities**: Provide shared functionality
- **Configuration**: Store rates and constants
- **Middleware**: Handle cross-cutting concerns

### 2. DRY (Don't Repeat Yourself)
- Shared base classes for common functionality
- Centralized utilities for validation, calculation, and error handling
- Consistent patterns across MEA and PEA implementations

### 3. Single Responsibility
- Each class/module has a single, well-defined purpose
- Clear separation between MEA and PEA logic
- Modular design for easy testing and maintenance

## Project Structure

```
src/
├── config/                     # Configuration files
│   ├── mea-rates.js           # MEA electricity rates
│   └── pea-rates.js           # PEA electricity rates
├── controllers/               # HTTP request handlers
│   ├── base-electricity.controller.js  # Base controller class
│   ├── mea-electricity.controller.js   # MEA controller
│   ├── pea-electricity.controller.js   # PEA controller
│   └── health.controller.js   # Health check controller
├── middleware/                # Koa middleware
│   └── request-logger.js      # Request logging middleware
├── routes/                    # API route definitions
│   ├── api.routes.js          # Main API routes
│   └── index.js               # Route aggregator
├── services/                  # Business logic layer
│   ├── base-electricity.service.js  # Base service class
│   ├── mea-electricity.service.js   # MEA calculation service
│   ├── pea-electricity.service.js   # PEA calculation service
│   └── electricity.service.js       # Legacy service (deprecated)
├── utils/                     # Shared utilities
│   ├── calculation-helpers.js # Calculation helper functions
│   ├── constants.js           # Shared constants
│   ├── error-handler.js       # Error handling utilities
│   ├── logger.js              # Logging utilities
│   └── validation.js          # Input validation utilities
└── app.js                     # Main application file
```

## Key Components

### 1. Base Classes

#### BaseElectricityService
- Abstract base class for electricity calculation services
- Provides common calculation logic for all tariff types
- Handles rate lookups and calculation orchestration
- Implements consistent result formatting

#### BaseElectricityController
- Abstract base class for electricity controllers
- Provides common request handling and validation
- Implements consistent error handling
- Supports both MEA and PEA providers

### 2. Configuration Management

#### Rate Configuration
- **MEA Rates**: Stored in `src/config/mea-rates.js`
- **PEA Rates**: Stored in `src/config/pea-rates.js`
- Centralized constants in `src/utils/constants.js`
- Easy to update rates without touching business logic

### 3. Utility Layer

#### Validation (`src/utils/validation.js`)
- Input validation for all calculation requests
- Provider-specific voltage level validation
- Tariff type validation
- Numeric value validation

#### Calculation Helpers (`src/utils/calculation-helpers.js`)
- Shared calculation functions
- Power factor calculations
- Tiered rate calculations
- VAT and FT charge calculations
- Result formatting

#### Error Handling (`src/utils/error-handler.js`)
- Custom error classes
- Consistent error response formatting
- Development vs production error details
- Async error wrapper for middleware

#### Logging (`src/utils/logger.js`)
- Centralized logging with configurable levels
- Request/response logging
- Calculation request logging
- Structured log format

### 4. Middleware

#### Request Logger (`src/middleware/request-logger.js`)
- Logs all API requests with timing
- Captures request metadata
- Performance monitoring

## API Structure

### Endpoints

#### MEA Endpoints
- `POST /api/mea/calculate/type-2` - Small General Service
- `POST /api/mea/calculate/type-3` - Medium General Service
- `POST /api/mea/calculate/type-4` - Large General Service
- `POST /api/mea/calculate/type-5` - Specific Business

#### PEA Endpoints
- `POST /api/pea/calculate/type-2` - Small Business Service
- `POST /api/pea/calculate/type-3` - Medium Business Service
- `POST /api/pea/calculate/type-4` - Large Business Service
- `POST /api/pea/calculate/type-5` - Specific Business Service

### Request Format
```json
{
  "tariffType": "normal|tou|tod",
  "voltageLevel": "<12kV|12-24kV|>=69kV|<22kV|22-33kV",
  "ftRateSatang": 0.0,
  "peakKvar": 0.0,
  "highestDemandChargeLast12m": 0.0,
  "usage": {
    "total_kwh": 0.0,
    "peak_kw": 0.0,
    "on_peak_kwh": 0.0,
    "off_peak_kwh": 0.0,
    "on_peak_kw": 0.0,
    "off_peak_kw": 0.0,
    "partial_peak_kw": 0.0
  }
}
```

### Response Format
```json
{
  "energyCharge": 0.0,
  "serviceCharge": 0.0,
  "baseTariff": 0.0,
  "ftCharge": 0.0,
  "vat": 0.0,
  "totalBill": 0.0
}
```

## Calculation Types

### Type 2 (Small Business/General Service)
- **Normal Tariff**: Tiered energy rates for low voltage, flat rate for high voltage
- **TOU Tariff**: Time-of-use rates with peak and off-peak periods

### Type 3 (Medium Business/General Service)
- **Normal Tariff**: Demand and energy charges
- **TOU Tariff**: Time-of-use demand and energy charges
- Includes power factor penalties and minimum bill factor

### Type 4 (Large Business/General Service)
- **TOD Tariff**: Time-of-day demand charges with three periods
- **TOU Tariff**: Time-of-use demand and energy charges
- Includes power factor penalties and minimum bill factor

### Type 5 (Specific Business)
- **Normal Tariff**: Demand and energy charges
- **TOU Tariff**: Time-of-use demand and energy charges
- Includes power factor penalties and minimum bill factor

## Error Handling

### Error Types
- **ValidationError**: Invalid input data
- **CalculationError**: Calculation-specific errors
- **ConfigurationError**: Configuration or rate lookup errors

### Error Response Format
```json
{
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "success": false,
  "field": "fieldName" // Optional
}
```

## Logging

### Log Levels
- **ERROR**: Application errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information (default)
- **DEBUG**: Detailed debugging information

### Environment Variables
- `LOG_LEVEL`: Set logging level (ERROR, WARN, INFO, DEBUG)
- `NODE_ENV`: Set environment (development, production)

## Testing

### Test Structure
- Unit tests for individual components
- Integration tests for API endpoints
- Validation tests for input data
- Calculation accuracy tests

### Running Tests
```bash
npm test              # Run all tests
npm run test:unit     # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:coverage # Run tests with coverage
```

## Deployment

### Environment Configuration
- Production environment variables
- Rate configuration updates
- Logging configuration
- Error handling configuration

### Docker Support
- Multi-stage Docker build
- Environment-specific configurations
- Health check endpoints
- Graceful shutdown handling

## Maintenance

### Adding New Providers
1. Create rate configuration file
2. Extend base service class
3. Extend base controller class
4. Add routes
5. Update documentation

### Updating Rates
1. Modify rate configuration files
2. Update tests
3. Deploy with zero downtime
4. Monitor calculation accuracy

### Adding New Calculation Types
1. Extend base service with new calculation method
2. Add validation rules
3. Update controller methods
4. Add comprehensive tests
5. Update documentation

## Performance Considerations

### Optimization Strategies
- Caching frequently used calculations
- Database storage for historical rates
- Async processing for bulk calculations
- Response compression
- Connection pooling

### Monitoring
- Request/response timing
- Error rates and types
- Calculation accuracy
- System resource usage
- API usage patterns

## Security

### Input Validation
- Strict type checking
- Range validation
- SQL injection prevention
- XSS protection

### Rate Limiting
- API rate limiting
- Request size limits
- Concurrent request limits

### Authentication & Authorization
- API key authentication
- Role-based access control
- Request signing
- Audit logging
