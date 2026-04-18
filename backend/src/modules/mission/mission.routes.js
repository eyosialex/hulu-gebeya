const express = require('express');
const router = express.Router();
const missionController = require('./mission.controller');
const protect = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { createMissionSchema } = require('./mission.validation');

router.get('/', missionController.getAllMissions);

// Only admins can create missions
router.post('/', protect, requireRole('ADMIN'), validate(createMissionSchema), missionController.createMission);

// Users interact with missions
router.post('/:id/start', protect, missionController.startMission);
router.post('/:id/complete', protect, missionController.completeMission);

module.exports = router;
