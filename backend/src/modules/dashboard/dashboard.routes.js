const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const protect = require('../../middleware/auth.middleware');

router.get('/me', protect, dashboardController.getDashboardMe);

module.exports = router;
