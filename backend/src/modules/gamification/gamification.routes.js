const express = require('express');
const router = express.Router();
const gamificationController = require('./gamification.controller');
const protect = require('../../middleware/auth.middleware');

router.get('/activity', protect, gamificationController.getActivity);

module.exports = router;
