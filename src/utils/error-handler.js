/**
 * Error Handling Utilities
 * Centralized error handling for consistent error responses
 */

const { logger } = require('./logger');

/**
 * Custom error classes for different types of errors
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class CalculationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CalculationError';
    this.statusCode = 400;
  }
}

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
    this.statusCode = 500;
  }
}

/**
 * Format error response for API
 * @param {Error} error - Error object
 * @returns {Object} - Formatted error response
 */
const formatErrorResponse = (error) => {
  const baseResponse = {
    error: error.message,
    timestamp: new Date().toISOString(),
    success: false
  };

  if (error.field) {
    baseResponse.field = error.field;
  }

  if (process.env.NODE_ENV === 'development') {
    baseResponse.stack = error.stack;
  }

  return baseResponse;
};

/**
 * Handle errors in Koa context
 * @param {Object} ctx - Koa context
 * @param {Error} error - Error object
 */
const handleError = (ctx, error) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let logLevel = 'error';

  if (error instanceof ValidationError) {
    statusCode = error.statusCode;
    message = error.message;
    logLevel = 'warn';
  } else if (error instanceof CalculationError) {
    statusCode = error.statusCode;
    message = error.message;
    logLevel = 'error';
  } else if (error instanceof ConfigurationError) {
    statusCode = error.statusCode;
    message = error.message;
    logLevel = 'error';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
    logLevel = 'warn';
  } else {
    // Log unexpected errors with full details
    logLevel = 'error';
  }

  // Log error with appropriate level
  const logData = {
    url: ctx.url,
    method: ctx.method,
    statusCode,
    errorType: error.name || 'Unknown',
    field: error.field,
    userAgent: ctx.get('User-Agent'),
    ip: ctx.ip,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  if (logLevel === 'error') {
    logger.error(message, logData);
  } else {
    logger.warn(message, logData);
  }

  ctx.status = statusCode;
  ctx.body = formatErrorResponse({
    message,
    field: error.field,
    stack: error.stack
  });
};

/**
 * Async error wrapper for Koa middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function with error handling
 */
const asyncErrorHandler = (fn) => {
  return async (ctx, next) => {
    try {
      await fn(ctx, next);
    } catch (error) {
      handleError(ctx, error);
    }
  };
};

module.exports = {
  ValidationError,
  CalculationError,
  ConfigurationError,
  formatErrorResponse,
  handleError,
  asyncErrorHandler
};
