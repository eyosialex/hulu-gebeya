const express = require('express');
const router = express.Router();
const leaderboardController = require('./leaderboard.controller');

router.get('/', leaderboardController.getLeaderboard);

module.exports = router;
