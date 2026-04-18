const express = require('express');
const router = express.Router();
const leaderboardController = require('./leaderboard.controller');

router.get('/', leaderboardController.getLifetime);
router.get('/daily', leaderboardController.getDaily);
router.get('/weekly', leaderboardController.getWeekly);

module.exports = router;
