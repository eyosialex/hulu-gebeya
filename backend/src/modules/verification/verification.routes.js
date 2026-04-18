const express = require('express');
const router = express.Router();
const verificationController = require('./verification.controller');
const protect = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const Joi = require('joi');

const verificationSchema = Joi.object({
  locationId: Joi.string().uuid().required(),
  vote: Joi.string().valid('UP', 'DOWN').required(),
  confidence: Joi.number().min(0).max(1).optional()
});

router.post('/', protect, validate(verificationSchema), verificationController.verifyLocation);

module.exports = router;
