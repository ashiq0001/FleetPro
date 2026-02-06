const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const vehicleController = require('../controllers/vehicles.controller');

router.post('/', isAuthenticated, vehicleController.addVehicle);
router.get('/', isAuthenticated, vehicleController.getVehicles);
router.get('/:vehicleId', isAuthenticated, vehicleController.getVehicleById);
router.put('/:vehicleId', isAuthenticated, vehicleController.updateVehicle);
router.delete('/:vehicleId', isAuthenticated, vehicleController.deleteVehicle);

module.exports = router;
