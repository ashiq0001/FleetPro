const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const reportsController = require('../controllers/reports.controller');

router.get('/summary', isAuthenticated, reportsController.getSummary);
router.get('/monthly', isAuthenticated, reportsController.getMonthly);
router.get('/yearly', isAuthenticated, reportsController.getYearly);

module.exports = router;
