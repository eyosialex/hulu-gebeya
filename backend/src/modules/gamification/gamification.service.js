const prisma = require('../../prisma/client');

/**
 * Handles gamification rewards inside a transaction block to ensure atomic operations.
 */
const rewardUser = async (tx, userId, action, details, points, coins, latitude = null, longitude = null) => {
  // Update user balances
  await tx.user.update({
    where: { id: userId },
    data: {
      points: { increment: points },
      coins: { increment: coins },
      reputationScore: { increment: (points / 100) } // Trust grows with points
    }
  });

  // Log the activity
  await tx.activityLog.create({
    data: {
      userId,
      action,
      details,
      points,
      coins,
      latitude,
      longitude
    }
  });
};

const getUserActivity = async (userId) => {
  return await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  rewardUser,
  getUserActivity
};
