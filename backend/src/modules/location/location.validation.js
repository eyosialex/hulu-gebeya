const Joi = require('joi');

const createLocationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).allow('', null),
  category: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  imageUrl: Joi.string().uri().allow('', null)
});

const updateLocationSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(500).allow('', null),
  category: Joi.string(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  imageUrl: Joi.string().uri().allow('', null)
}).min(1); // At least one field required for update

const nearbyQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(0.1).max(100).default(5) // km, default 5km
});

module.exports = {
  createLocationSchema,
  updateLocationSchema,
  nearbyQuerySchema
};
