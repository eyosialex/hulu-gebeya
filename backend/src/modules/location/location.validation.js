const Joi = require('joi');

const createLocationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).allow('', null),
  category: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  imageUrl: Joi.string().uri().allow('', null)
});

module.exports = {
  createLocationSchema
};
