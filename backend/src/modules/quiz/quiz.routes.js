const express = require('express');
const router = express.Router();
const quizController = require('./quiz.controller');
const protect = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { createQuizSchema, answerQuizSchema } = require('./quiz.validation');

router.get('/', quizController.getAllQuizzes);

// Only admins can create quizzes
router.post('/', protect, requireRole('ADMIN'), validate(createQuizSchema), quizController.createQuiz);

// Users interact with quizzes
router.post('/:id/answer', protect, validate(answerQuizSchema), quizController.answerQuiz);

module.exports = router;
