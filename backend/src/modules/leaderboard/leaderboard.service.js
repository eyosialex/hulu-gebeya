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
  const userIds = rankings.length > 0 ? rankings.map(r => r.userId) : [];
  
  const users = await prisma.user.findMany({
    where: rankings.length > 0 ? { id: { in: userIds } } : {},
    orderBy: rankings.length === 0 ? { points: 'desc' } : undefined,
    take: 20,
    select: {
      id: true,
      name: true,
      points: true,
      reputationScore: true,
      streakCount: true,
      _count: {
        select: { locations: true }
      }
    }
  });

  const finalUsers = rankings.length > 0 
    ? rankings.map(rank => {
        const u = users.find(user => user.id === rank.userId);
        return { ...u, pointsEarned: rank._sum.points || 0 };
      })
    : users.map(u => ({ ...u, pointsEarned: u.points }));

  return finalUsers.map((u, index) => ({
    rank: index + 1,
    userId: u.id,
    name: u.name,
    points: u.pointsEarned,
    missions: u._count?.locations || 0,
    streak: u.streakCount || 0,
    badge: u.reputationScore > 500 ? "Elite Explorer" : u.reputationScore > 100 ? "Urban Scout" : "Newcomer"
  }));
};

module.exports = {
  getLeaderboard
};
