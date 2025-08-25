/**
 * MEA Electricity Controller
 * Handles MEA electricity bill calculation requests
 */

const BaseElectricityController = require('./base-electricity.controller');
const meaElectricityService = require('../services/mea-electricity.service');

class MEAElectricityController extends BaseElectricityController {
  constructor() {
    super(meaElectricityService, 'mea');
  }
}

// Create singleton instance
const meaElectricityController = new MEAElectricityController();

module.exports = {
  calculateType2: (ctx) => meaElectricityController.calculateType2(ctx),
  calculateType3: (ctx) => meaElectricityController.calculateType3(ctx),
  calculateType4: (ctx) => meaElectricityController.calculateType4(ctx),
  calculateType5: (ctx) => meaElectricityController.calculateType5(ctx)
};
