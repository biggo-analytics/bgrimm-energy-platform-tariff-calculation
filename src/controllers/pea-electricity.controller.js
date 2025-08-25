/**
 * PEA Electricity Controller
 * Handles PEA electricity bill calculation requests
 */

const BaseElectricityController = require('./base-electricity.controller');
const peaElectricityService = require('../services/pea-electricity.service');

class PEAElectricityController extends BaseElectricityController {
  constructor() {
    super(peaElectricityService, 'pea');
  }
}

// Create singleton instance
const peaElectricityController = new PEAElectricityController();

module.exports = {
  calculateType2: (ctx) => peaElectricityController.calculateType2(ctx),
  calculateType3: (ctx) => peaElectricityController.calculateType3(ctx),
  calculateType4: (ctx) => peaElectricityController.calculateType4(ctx),
  calculateType5: (ctx) => peaElectricityController.calculateType5(ctx)
};