const express = require('express');
const router = express.Router();
const verificationController = require('./verification.controller');
const protect = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const Joi = require('joi');

const verificationSchema = Joi.object({
  vote: Joi.string().valid('UP', 'DOWN').required(),
  confidence: Joi.number().min(0).max(1).optional()
  // locationId is now passed via URL params, so we don't require it in the body
});

router.post('/:id/verify', protect, validate(verificationSchema), verificationController.verifyLocation);
router.get('/:id/verifications', verificationController.getVerifications);

module.exports = router;
