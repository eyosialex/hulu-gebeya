const express = require('express');
const router = express.Router();
const navigationController = require('./navigation.controller');
const protect = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { saveRouteSchema } = require('./navigation.validation');

// Public mapping utility
router.get('/route', navigationController.getRoute); // accepts query parameters

// Protected saves/history
router.post('/save', protect, validate(saveRouteSchema), navigationController.saveRoute);
router.get('/saved', protect, navigationController.getSavedRoutes);

module.exports = router;
