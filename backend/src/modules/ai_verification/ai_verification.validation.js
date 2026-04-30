const Joi = require('joi');

const verifyLocationSchema = Joi.object({
  userLat: Joi.number().required().min(-90).max(90),
  userLng: Joi.number().required().min(-180).max(180),
  isSimulator: Joi.boolean().default(false)
});

module.exports = {
  verifyLocationSchema,
};
