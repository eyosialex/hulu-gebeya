const leaderboardService = require('./leaderboard.service');

const getLeaderboard = async (req, res, next) => {
  try {
    const { timeframe } = req.query; // daily, weekly, lifetime
    const leaderboard = await leaderboardService.getLeaderboard(timeframe);
    
    res.json({
      timeframe: timeframe || 'lifetime',
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard
};
