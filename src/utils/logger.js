/**
 * Logging Utilities
 * Centralized logging for consistent log format and levels
 */

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Get current log level from environment
 */
const getLogLevel = () => {
  const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
  return LOG_LEVELS[level] || LOG_LEVELS.INFO;
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} - Formatted log message
 */
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const baseLog = `[${timestamp}] ${level}: ${message}`;
  
  if (Object.keys(meta).length > 0) {
    return `${baseLog} ${JSON.stringify(meta)}`;
  }
  
  return baseLog;
};

/**
 * Logger class
 */
class Logger {
  constructor() {
    this.logLevel = getLogLevel();
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object} meta - Additional metadata
   */
  error(message, meta = {}) {
    if (this.logLevel >= LOG_LEVELS.ERROR) {
      console.error(formatLogMessage('ERROR', message, meta));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    if (this.logLevel >= LOG_LEVELS.WARN) {
      console.warn(formatLogMessage('WARN', message, meta));
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    if (this.logLevel >= LOG_LEVELS.INFO) {
      console.info(formatLogMessage('INFO', message, meta));
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (this.logLevel >= LOG_LEVELS.DEBUG) {
      console.debug(formatLogMessage('DEBUG', message, meta));
    }
  }

  /**
   * Log API request
   * @param {Object} ctx - Koa context
   * @param {number} duration - Request duration in ms
   */
  logRequest(ctx, duration) {
    const { method, url, status } = ctx;
    const userAgent = ctx.get('User-Agent') || 'Unknown';
    const ip = ctx.ip || ctx.request.ip || 'Unknown';
    
    this.info('API Request', {
      method,
      url,
      status,
      duration: `${duration}ms`,
      userAgent,
      ip
    });
  }

  /**
   * Log calculation request
   * @param {string} provider - Provider (mea/pea)
   * @param {string} calculationType - Calculation type
   * @param {Object} data - Input data
   */
  logCalculation(provider, calculationType, data) {
    this.info('Calculation Request', {
      provider,
      calculationType,
      voltageLevel: data.voltageLevel,
      tariffType: data.tariffType,
      hasUsage: !!data.usage
    });
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = {
  logger,
  LOG_LEVELS
};
