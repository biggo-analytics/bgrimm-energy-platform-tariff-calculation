const electricityService = require('../services/electricity.service');
const { ValidationError, asyncErrorHandler } = require('../utils/error-handler');
const { logger } = require('../utils/logger');

/**
 * Electricity Controller
 * Handles electricity bill calculation requests
 */

// Input validation helper
const validateCalculationInput = (body, requiredFields) => {
  if (!body) {
    throw new ValidationError('Request body is required');
  }

  for (const field of requiredFields) {
    if (!body[field]) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }
  }

  return true;
};

// Type 2 - Small General Service
const calculateType2 = asyncErrorHandler(async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'usage'];
  const { body } = ctx.request;
  
  validateCalculationInput(body, requiredFields);
  
  logger.logCalculation('mea', 'type-2', body);
  const result = electricityService.calculateBill('type-2', body);
  
  ctx.body = {
    ...result,
    success: true,
    timestamp: new Date().toISOString()
  };
});

// Type 3 - Medium General Service
const calculateType3 = asyncErrorHandler(async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  const { body } = ctx.request;
  
  validateCalculationInput(body, requiredFields);
  
  logger.logCalculation('mea', 'type-3', body);
  const result = electricityService.calculateBill('type-3', body);
  
  ctx.body = {
    ...result,
    success: true,
    timestamp: new Date().toISOString()
  };
});

// Type 4 - Large General Service
const calculateType4 = asyncErrorHandler(async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  const { body } = ctx.request;
  
  validateCalculationInput(body, requiredFields);
  
  logger.logCalculation('mea', 'type-4', body);
  const result = electricityService.calculateBill('type-4', body);
  
  ctx.body = {
    ...result,
    success: true,
    timestamp: new Date().toISOString()
  };
});

// Type 5 - Specific Business
const calculateType5 = asyncErrorHandler(async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  const { body } = ctx.request;
  
  validateCalculationInput(body, requiredFields);
  
  logger.logCalculation('mea', 'type-5', body);
  const result = electricityService.calculateBill('type-5', body);
  
  ctx.body = {
    ...result,
    success: true,
    timestamp: new Date().toISOString()
  };
});

module.exports = {
  calculateType2,
  calculateType3,
  calculateType4,
  calculateType5
};
