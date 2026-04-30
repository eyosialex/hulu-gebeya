const gamificationService = require('./gamification.service');

const getActivity = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const activities = await gamificationService.getUserActivity(userId);
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivity
};
