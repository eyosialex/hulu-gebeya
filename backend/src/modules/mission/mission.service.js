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

const { assertUserNearLocation, validateMovement } = require('../../utils/geo');

const completeMission = async (missionId, userId, userLat, userLng, isSimulator = false) => {
  const simulatorMode = isSimulator === true;

  // Production Safety
  if (simulatorMode && process.env.NODE_ENV !== 'development') {
    throw new Error('Crucial Exception: Simulator mode is disabled in non-development environments.');
  }

  const userMission = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId, missionId } },
    include: { 
      mission: {
        include: { location: true }
      } 
    }
  });

  if (!userMission) throw new Error('Mission not started');
  
  // --- UNIFIED EVALUATION ENGINE ---
  const evaluation = {
    passed: true,
    severity: simulatorMode ? 'warning' : 'error',
    checks: {
      status: userMission.status === 'ACTIVE',
      proximity: true,
      movement: true
    },
    errors: []
  };

  // 1. Status Check
  if (!evaluation.checks.status) {
    evaluation.passed = false;
    evaluation.errors.push(`Mission status: ${userMission.status}`);
  }

  // 2. Safety/Movement (Always fails hard regardless of mode)
  const lastActivity = await prisma.activityLog.findFirst({
    where: { userId, latitude: { not: null }, longitude: { not: null } },
    orderBy: { createdAt: 'desc' }
  });
  const movement = validateMovement(lastActivity, userLat, userLng);
  if (!movement.valid) {
    throw new Error(`Security Exception: ${movement.reason}`);
  }

  // 3. Proximity Check
  const targetLat = userMission.mission.latitude || userMission.mission.location?.latitude;
  const targetLng = userMission.mission.longitude || userMission.mission.location?.longitude;
  if (targetLat && targetLng) {
    try {
      assertUserNearLocation(userLat, userLng, targetLat, targetLng, 100);
    } catch (e) {
      evaluation.passed = false;
      evaluation.checks.proximity = false;
      evaluation.errors.push(e.message);
    }
  }

  // --- MODE-AWARE INTERPRETATION ---
  if (simulatorMode) {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'MISSION_COMPLETED_SIMULATOR',
        details: JSON.stringify({ 
          msg: `SIMULATED: ${userMission.mission.title}`, 
          mode: 'simulator',
          evaluation_passed: evaluation.passed
        }),
        latitude: userLat, longitude: userLng
      }
    });

    return {
      mode: 'simulator',
      accepted: true,
      state: 'no-op',
      dbWrite: false,
      evaluation
    };
  }

  // Real Mode: Fail if any evaluation check failed
  if (!evaluation.passed) {
    const error = new Error(`Mission Validation Failed: ${evaluation.errors.join(', ')}`);
    error.status = 400;
    throw error;
  }
  
  return await prisma.$transaction(async (tx) => {
    const updated = await tx.userMission.update({
      where: { id: userMission.id },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });

    await gamificationService.rewardUser(
      tx, userId, 'MISSION_COMPLETED', 
      JSON.stringify({ msg: `Mission: ${userMission.mission.title}`, mode: 'real' }), 
      userMission.mission.points, userMission.mission.coins,
      userLat, userLng
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
