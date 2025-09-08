/**
 * Electricity Controller
 * Controller that uses the strategy pattern for electricity bill calculations
 */

const electricityService = require('../services/electricity.service');
const { logger } = require('../utils/logger');

class ElectricityController {
  /**
   * Calculate electricity bill using strategy pattern
   * @param {Object} ctx - Koa context
   */
  async calculateBill(ctx) {
    try {
      const { provider, calculationType } = ctx.params;
      const data = ctx.request.body;

      // Validate required parameters
      if (!provider || !calculationType) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Provider and calculation type are required',
          timestamp: new Date().toISOString()
        };
        return;
      }

      // Validate request body exists
      if (!data || Object.keys(data).length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Request body is required and cannot be empty',
          timestamp: new Date().toISOString()
        };
        return;
      }

      // Perform calculation using strategy
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

  /**
   * Get service information
   * @param {Object} ctx - Koa context
   */
  async getServiceInfo(ctx) {
    try {
      const serviceInfo = electricityService.getServiceInfo();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: serviceInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to retrieve service information',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available strategies for a provider
   * @param {Object} ctx - Koa context
   */
  async getAvailableStrategies(ctx) {
    try {
      const { provider } = ctx.params;

      if (!provider) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Provider parameter is required',
          timestamp: new Date().toISOString()
        };
        return;
      }

      const strategies = electricityService.getAvailableStrategies(provider);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          provider,
          strategies,
          count: strategies.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available strategies for a calculation type
   * @param {Object} ctx - Koa context
   */
  async getStrategiesForCalculationType(ctx) {
    try {
      const { calculationType } = ctx.params;

      if (!calculationType) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Calculation type parameter is required',
          timestamp: new Date().toISOString()
        };
        return;
      }

      const strategies = electricityService.getStrategiesForCalculationType(calculationType);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          calculationType,
          strategies,
          count: strategies.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate if a combination is supported
   * @param {Object} ctx - Koa context
   */
  async validateCombination(ctx) {
    try {
      const { provider, calculationType, tariffType, voltageLevel } = ctx.query;

      if (!provider || !calculationType || !tariffType || !voltageLevel) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'All parameters (provider, calculationType, tariffType, voltageLevel) are required',
          timestamp: new Date().toISOString()
        };
        return;
      }

      const isSupported = electricityService.isCombinationSupported(
        provider, 
        calculationType, 
        tariffType, 
        voltageLevel
      );

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          provider,
          calculationType,
          tariffType,
          voltageLevel,
          isSupported
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const electricityController = new ElectricityController();

module.exports = {
  calculateBill: (ctx) => electricityController.calculateBill(ctx),
  getServiceInfo: (ctx) => electricityController.getServiceInfo(ctx),
  getAvailableStrategies: (ctx) => electricityController.getAvailableStrategies(ctx),
  getStrategiesForCalculationType: (ctx) => electricityController.getStrategiesForCalculationType(ctx),
  validateCombination: (ctx) => electricityController.validateCombination(ctx)
};
