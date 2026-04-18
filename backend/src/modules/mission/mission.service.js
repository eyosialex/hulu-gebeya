const prisma = require('../../prisma/client');
const gamificationService = require('../gamification/gamification.service');

const getAllMissions = async () => {
  return await prisma.mission.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const createMission = async (data, adminId) => {
  const { title, description, points, coins } = data;
  return await prisma.mission.create({
    data: {
      title,
      description,
      points,
      coins,
      createdById: adminId
    }
  });
};

const startMission = async (missionId, userId) => {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) throw new Error('Mission not found');

  try {
    return await prisma.userMission.create({
      data: {
        missionId,
        userId,
        status: 'ACTIVE'
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Mission already started or completed by this user');
    }
    throw error;
  }
};

const completeMission = async (missionId, userId) => {
  const userMission = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId, missionId } },
    include: { mission: true }
  });

  if (!userMission) throw new Error('Mission not started');
  if (userMission.status === 'COMPLETED') throw new Error('Mission already completed');

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.userMission.update({
      where: { id: userMission.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date() // Mark the time of completion
      }
    });

    // Atomic Gamification Reward
    await gamificationService.rewardUser(
      tx, 
      userId, 
      'MISSION_COMPLETED', 
      `Completed mission: ${userMission.mission.title}`, 
      userMission.mission.points, 
      userMission.mission.coins
    );

    return updated;
  });
};

module.exports = {
  getAllMissions,
  createMission,
  startMission,
  completeMission
};
