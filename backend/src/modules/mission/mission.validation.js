const Joi = require('joi');

const createMissionSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  points: Joi.number().integer().min(0).max(1000).required(),
  coins: Joi.number().integer().min(0).max(100).required()
});

const completeMissionSchema = Joi.object({
  userLat: Joi.number().required().min(-90).max(90),
  userLng: Joi.number().required().min(-180).max(180),
  isSimulator: Joi.boolean().default(false)
});

module.exports = {
  createMissionSchema,
  completeMissionSchema
};
