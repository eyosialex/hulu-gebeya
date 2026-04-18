const Joi = require('joi');

const createQuizSchema = Joi.object({
  question: Joi.string().min(5).max(500).required(),
  correctAnswer: Joi.string().max(100).required(),
  points: Joi.number().integer().min(0).max(500).required(),
  coins: Joi.number().integer().min(0).max(100).required(),
  locationId: Joi.string().uuid().required()
});

const answerQuizSchema = Joi.object({
  answer: Joi.string().required()
});

module.exports = {
  createQuizSchema,
  answerQuizSchema
};
