const express = require('express');
const router = express.Router();
const locationController = require('./location.controller');
const protect = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { createLocationSchema, updateLocationSchema } = require('./location.validation');

// Public routes
router.get('/', locationController.getAllLocations);
router.get('/nearby', locationController.getNearbyLocations);
router.get('/:id', locationController.getLocationById);

// Protected routes
router.post('/', protect, validate(createLocationSchema), locationController.createLocation);
router.put('/:id', protect, validate(updateLocationSchema), locationController.updateLocation);
router.delete('/:id', protect, locationController.deleteLocation);

module.exports = router;
