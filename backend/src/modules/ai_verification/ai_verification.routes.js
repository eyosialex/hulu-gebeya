const express = require('express');
const router = express.Router();
const aiVerificationController = require('./ai_verification.controller');
const protect = require('../../middleware/auth.middleware');

// We protect it, though admins or location workers typically trigger this.
router.post('/locations/:id/ai-verify', protect, aiVerificationController.triggerAiVerification);

module.exports = router;
