const prisma = require('../../prisma/client');

/**
 * Handles gamification rewards inside a transaction block to ensure atomic operations.
 */
const rewardUser = async (tx, userId, action, details, points, coins) => {
  // Update user balances
  await tx.user.update({
    where: { id: userId },
    data: {
      points: { increment: points },
      coins: { increment: coins }
    }
  });

  // Log the activity
  await tx.activityLog.create({
    data: {
      userId,
      action,
      details,
      points,
      coins
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
