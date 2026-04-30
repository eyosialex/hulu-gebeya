const quizService = require('./quiz.service');

const getAllQuizzes = async (req, res, next) => {
  try {
    const { locationId } = req.query;
    const quizzes = await quizService.getAllQuizzes(locationId);
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const quiz = await quizService.createQuiz(req.body, adminId);
    
    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    next(error);
  }
};

const answerQuiz = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { answer, timeTaken } = req.body;

    const result = await quizService.answerQuiz(id, userId, answer, timeTaken);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  createQuiz,
  answerQuiz
};
