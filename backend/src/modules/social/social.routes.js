const express = require('express');
const router = express.Router();
const socialController = require('./social.controller');
const protect = require('../../middleware/auth.middleware');

router.get('/friends', protect, socialController.getFriends);
router.get('/quests', protect, socialController.getQuests);

module.exports = router;
