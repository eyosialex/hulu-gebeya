const leaderboardService = require('./leaderboard.service');

const getLifetime = async (req, res, next) => {
  try {
    const leaderboard = await leaderboardService.getLeaderboard('lifetime');
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

const getDaily = async (req, res, next) => {
  try {
    const leaderboard = await leaderboardService.getLeaderboard('daily');
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

const getWeekly = async (req, res, next) => {
  try {
    const leaderboard = await leaderboardService.getLeaderboard('weekly');
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLifetime,
  getDaily,
  getWeekly
};
