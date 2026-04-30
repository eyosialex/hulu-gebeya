const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const protect = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const Joi = require('joi');

const updateSettingsSchema = Joi.object({
  displayName: Joi.string().min(2).max(50),
  city: Joi.string().max(100),
  bio: Joi.string().max(300),
  gpsHighAccuracy: Joi.boolean(),
  aiCalibrationAssist: Joi.boolean(),
  incognitoMode: Joi.boolean(),
  locationGhosting: Joi.boolean()
}).min(1);

router.put('/me/settings', protect, validate(updateSettingsSchema), userController.updateSettings);

module.exports = router;
