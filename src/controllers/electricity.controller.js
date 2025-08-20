const electricityService = require('../services/electricity.service');

/**
 * Electricity Controller
 * Handles electricity bill calculation requests
 */

// Input validation helper
const validateCalculationInput = (ctx, requiredFields) => {
  const { body } = ctx.request;
  
  if (!body) {
    ctx.status = 400;
    ctx.body = { error: 'Request body is required' };
    return false;
  }

  for (const field of requiredFields) {
    if (!body[field]) {
      ctx.status = 400;
      ctx.body = { error: `Missing required field: ${field}` };
      return false;
    }
  }

  return true;
};

// Type 2 - Small General Service
const calculateType2 = async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'usage'];
  
  if (!validateCalculationInput(ctx, requiredFields)) {
    return;
  }

  try {
    const result = electricityService.calculateBill('type-2', ctx.request.body);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// Type 3 - Medium General Service
const calculateType3 = async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  
  if (!validateCalculationInput(ctx, requiredFields)) {
    return;
  }

  try {
    const result = electricityService.calculateBill('type-3', ctx.request.body);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// Type 4 - Large General Service
const calculateType4 = async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  
  if (!validateCalculationInput(ctx, requiredFields)) {
    return;
  }

  try {
    const result = electricityService.calculateBill('type-4', ctx.request.body);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// Type 5 - Specific Business
const calculateType5 = async (ctx) => {
  const requiredFields = ['tariffType', 'voltageLevel', 'ftRateSatang', 'peakKvar', 'highestDemandChargeLast12m', 'usage'];
  
  if (!validateCalculationInput(ctx, requiredFields)) {
    return;
  }

  try {
    const result = electricityService.calculateBill('type-5', ctx.request.body);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

module.exports = {
  calculateType2,
  calculateType3,
  calculateType4,
  calculateType5
};
