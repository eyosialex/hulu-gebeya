const prisma = require('../../prisma/client');

const getFriends = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const friendships = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            points: true,
            city: true,
            lastActiveAt: true
          }
        }
      }
    });

    const friendList = friendships.map(f => {
      const isLive = (new Date() - new Date(f.friend.lastActiveAt)) < 3600000; // Live if active in last hour
      return {
        userId: f.friend.id,
        name: f.friend.name,
        status: isLive ? "Active explorer" : "Idle",
        distance: "Nearby", // Haversine can be added later if current user lat/lng is available
        live: isLive,
        xp: f.friend.points,
        categoryContext: "Explorer"
      };
    });

    res.json(friendList);
  } catch (error) {
    next(error);
  }
};

const getQuests = async (req, res, next) => {
  try {
    // Current missions that are ACTIVE could be served as team quests
    const missions = await prisma.mission.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' }
    });

    const quests = missions.map(m => ({
      id: m.id,
      title: m.title,
      desc: m.description,
      rewardString: `+${m.points} XP`,
      progressPercentage: 0, // Logic for team progress would go here
      slotsTaken: 0,
      slotsTotal: 3
    }));

    res.json(quests);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFriends,
  getQuests
};
