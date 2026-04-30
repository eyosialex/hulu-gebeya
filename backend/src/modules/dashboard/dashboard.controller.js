const prisma = require('../../prisma/client');
const gamificationService = require('../gamification/gamification.service');

const getDashboardMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Fetch user and normalize data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        points: true,
        coins: true,
        reputationScore: true,
        streakCount: true,
        city: true,
        bio: true,
        createdAt: true,
        _count: {
          select: { locations: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process rank and level matching frontend expectations
    const level = Math.floor(user.points / 1000) + 1;
    const xp = user.points;
    const xpNext = level * 1000;
    
    let rank = "Bronze";
    if (user.points > 10000) rank = "Diamond";
    else if (user.points > 5000) rank = "Gold";
    else if (user.points > 2000) rank = "Silver";

    const initials = user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Fetch recent activity
    const activityLogs = await gamificationService.getUserActivity(userId);
    
    const recentActivity = activityLogs.map(log => ({
      missionId: log.id,
      name: log.details || log.action,
      cat: "Activity",
      xp: log.points,
      coins: log.coins,
      when: log.createdAt
    }));

    const dashboardUser = {
      id: user.id,
      name: user.name,
      initials,
      rank,
      level,
      xp,
      xpNext,
      coins: user.coins,
      points: user.points,
      streak: user.streakCount,
      trustScore: user.reputationScore,
      totalMissions: user._count.locations,
      city: user.city || "Lagos"
    };

    res.json({
      user: dashboardUser,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMe
};
