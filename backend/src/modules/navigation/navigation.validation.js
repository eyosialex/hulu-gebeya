const Joi = require('joi');

const calculateRouteSchema = Joi.object({
  originLat: Joi.number().min(-90).max(90).required(),
  originLng: Joi.number().min(-180).max(180).required(),
  destinationLat: Joi.number().min(-90).max(90).required(),
  destinationLng: Joi.number().min(-180).max(180).required(),
  waypoints: Joi.array().items(
    Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required()
    })
  ).optional()
});

const saveRouteSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  originLat: Joi.number().min(-90).max(90).required(),
  originLng: Joi.number().min(-180).max(180).required(),
  destinationLat: Joi.number().min(-90).max(90).required(),
  destinationLng: Joi.number().min(-180).max(180).required(),
  waypoints: Joi.array().items(
    Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required()
    })
  ).optional()
});

module.exports = {
  calculateRouteSchema,
  saveRouteSchema
};
