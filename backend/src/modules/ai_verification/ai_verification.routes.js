const express = require('express');
const router = express.Router();
const aiVerificationController = require('./ai_verification.controller');
const protect = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');
const validate = require('../../middleware/validate.middleware');
const aiVerificationValidation = require('./ai_verification.validation');

// We protect it, though admins or location workers typically trigger this.
router.post('/locations/:id/ai-verify', [
  protect, 
  upload.single('verificationImage'),
  validate(aiVerificationValidation.verifyLocationSchema)
], aiVerificationController.triggerAiVerification);

module.exports = router;
