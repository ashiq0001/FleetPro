const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const driverController = require('../controllers/drivers.controller');

router.post('/', isAuthenticated, driverController.addDriver);
router.get('/', isAuthenticated, driverController.getDrivers);
router.put('/:driverId', isAuthenticated, driverController.updateDriver);
router.delete('/:driverId', isAuthenticated, driverController.deleteDriver);

module.exports = router;
