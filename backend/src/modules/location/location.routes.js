const express = require('express');
const router = express.Router();
const locationController = require('./location.controller');
const protect = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { createLocationSchema } = require('./location.validation');

router.post('/', protect, validate(createLocationSchema), locationController.createLocation);
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);

module.exports = router;
