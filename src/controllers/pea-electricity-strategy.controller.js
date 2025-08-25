/**
 * PEA Electricity Controller (Strategy Pattern)
 * Handles PEA electricity bill calculation requests using Strategy Pattern
 */

const BaseElectricityController = require('./base-electricity.controller');
const peaElectricityStrategyService = require('../services/pea-electricity-strategy.service');

class PEAElectricityStrategyController extends BaseElectricityController {
  constructor() {
    super(peaElectricityStrategyService, 'pea');
  }

  /**
   * Get PEA service information
   * @param {Object} ctx - Koa context
   */
  async getServiceInfo(ctx) {
    try {
      const serviceInfo = this.electricityService.getServiceInfo();
      
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
   * Get rate information for specific configuration
   * @param {Object} ctx - Koa context
   */
  async getRateInfo(ctx) {
    try {
      const { calculationType, tariffType, voltageLevel } = ctx.query;
      
      if (!calculationType || !tariffType || !voltageLevel) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Missing required parameters: calculationType, tariffType, voltageLevel',
          timestamp: new Date().toISOString()
        };
        return;
      }

      const rateInfo = this.electricityService.getRateInformation(
        calculationType, 
        tariffType, 
        voltageLevel
      );
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: rateInfo,
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
   * Get available tariff types for calculation type
   * @param {Object} ctx - Koa context
   */
  async getAvailableTariffTypes(ctx) {
    try {
      const { calculationType } = ctx.params;
      
      if (!calculationType) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Missing calculationType parameter',
          timestamp: new Date().toISOString()
        };
        return;
      }

      const availableTypes = this.electricityService.getAvailableTariffTypes(calculationType);
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          calculationType,
          availableTariffTypes: availableTypes
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
const peaElectricityStrategyController = new PEAElectricityStrategyController();

module.exports = {
  calculateType2: (ctx) => peaElectricityStrategyController.calculateType2(ctx),
  calculateType3: (ctx) => peaElectricityStrategyController.calculateType3(ctx),
  calculateType4: (ctx) => peaElectricityStrategyController.calculateType4(ctx),
  calculateType5: (ctx) => peaElectricityStrategyController.calculateType5(ctx),
  getServiceInfo: (ctx) => peaElectricityStrategyController.getServiceInfo(ctx),
  getRateInfo: (ctx) => peaElectricityStrategyController.getRateInfo(ctx),
  getAvailableTariffTypes: (ctx) => peaElectricityStrategyController.getAvailableTariffTypes(ctx)
};
