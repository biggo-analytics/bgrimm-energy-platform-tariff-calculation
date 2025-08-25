const Router = require('@koa/router');
const healthController = require('../controllers/health.controller');
const meaElectricityController = require('../controllers/mea-electricity.controller');
const peaElectricityController = require('../controllers/pea-electricity.controller');

const router = new Router();

// Info endpoint
router.get('/info', healthController.getInfo);

// MEA electricity calculation endpoints
router.post('/mea/calculate/type-2', meaElectricityController.calculateType2);
router.post('/mea/calculate/type-3', meaElectricityController.calculateType3);
router.post('/mea/calculate/type-4', meaElectricityController.calculateType4);
router.post('/mea/calculate/type-5', meaElectricityController.calculateType5);

// PEA electricity calculation endpoints
router.post('/pea/calculate/type-2', peaElectricityController.calculateType2);
router.post('/pea/calculate/type-3', peaElectricityController.calculateType3);
router.post('/pea/calculate/type-4', peaElectricityController.calculateType4);
router.post('/pea/calculate/type-5', peaElectricityController.calculateType5);

module.exports = router;
