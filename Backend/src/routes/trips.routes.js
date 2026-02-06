const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const tripsController = require('../controllers/trips.controller');

router.post('/', isAuthenticated, tripsController.addTrip);
router.get('/', isAuthenticated, tripsController.getTrips);
router.put('/:tripId', isAuthenticated, tripsController.updateTrip);
router.delete('/:tripId', isAuthenticated, tripsController.deleteTrip);

module.exports = router;
