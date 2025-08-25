const Router = require('@koa/router');
const healthController = require('../controllers/health.controller');
const electricityController = require('../controllers/electricity.controller');
const peaElectricityController = require('../controllers/pea-electricity.controller');

const router = new Router();

// Info endpoint
router.get('/info', healthController.getInfo);

// MEA electricity calculation endpoints
router.post('/mea/calculate/type-2', electricityController.calculateType2);
router.post('/mea/calculate/type-3', electricityController.calculateType3);
router.post('/mea/calculate/type-4', electricityController.calculateType4);
router.post('/mea/calculate/type-5', electricityController.calculateType5);

// PEA electricity calculation endpoints
router.post('/pea/calculate/type-2', peaElectricityController.calculateType2);

module.exports = router;
