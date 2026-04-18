const prisma = require('../../prisma/client');

const getLeaderboard = async (timeframe) => {
  let startDate = new Date();
  
  if (timeframe === 'daily') {
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === 'weekly') {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Default to lifetime if no timeframe is specified
    return await prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        points: true,
        reputationScore: true
      }
    });
  }

  // Optimized aggregation using GroupBy
  const rankings = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: startDate }
    },
    _sum: {
        points: true
    },
    orderBy: {
      _sum: {
        points: 'desc'
      }
    },
    take: 20
  });

  // Fetch user details for the top ranked users
  const userIds = rankings.map(r => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      reputationScore: true
    }
  });

  // Merge user details with rankings
  return rankings.map(rank => {
    const user = users.find(u => u.id === rank.userId);
    return {
      userId: rank.userId,
      name: user?.name,
      reputationScore: user?.reputationScore,
      pointsEarned: rank._sum.points || 0
    };
  }).sort((a, b) => b.pointsEarned - a.pointsEarned);
};

module.exports = {
  getLeaderboard
};
