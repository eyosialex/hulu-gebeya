const missionService = require('./mission.service');

const getAllMissions = async (req, res, next) => {
  try {
    const missions = await missionService.getAllMissions();
    res.json(missions);
  } catch (error) {
    next(error);
  }
};

const createMission = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const mission = await missionService.createMission(req.body, adminId);
    
    res.status(201).json({
      message: 'Mission created successfully',
      mission
    });
  } catch (error) {
    next(error);
  }
};

const startMission = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const userMission = await missionService.startMission(id, userId);

    res.status(201).json({
      message: 'Mission started',
      userMission
    });
  } catch (error) {
    next(error);
  }
};

const completeMission = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const userMission = await missionService.completeMission(id, userId);

    res.json({
      message: 'Mission completed successfully',
      userMission
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMissions,
  createMission,
  startMission,
  completeMission
};
