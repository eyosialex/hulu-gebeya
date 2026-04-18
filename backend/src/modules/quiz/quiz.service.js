const prisma = require('../../prisma/client');
const gamificationService = require('../gamification/gamification.service');

const getAllQuizzes = async (locationId) => {
  const filters = {};
  if (locationId) {
    filters.locationId = locationId;
  }
  return await prisma.quiz.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' }
  });
};

const createQuiz = async (data, adminId) => {
  const { question, correctAnswer, points, coins, locationId } = data;
  return await prisma.quiz.create({
    data: {
      question,
      correctAnswer: correctAnswer.toLowerCase().trim(),
      points,
      coins,
      locationId,
      createdById: adminId
    }
  });
};

const answerQuiz = async (quizId, userId, providedAnswer) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw new Error('Quiz not found');

  // Check if already attempted
  const existingAttempt = await prisma.userQuiz.findUnique({
    where: { userId_quizId: { userId, quizId } }
  });
  if (existingAttempt) {
    throw new Error('You have already answered this quiz');
  }

  const isCorrect = providedAnswer.toLowerCase().trim() === quiz.correctAnswer;

  return await prisma.$transaction(async (tx) => {
    // Record attempt
    const userQuiz = await tx.userQuiz.create({
      data: {
        userId,
        quizId,
        isCorrect
      }
    });

    // Reward if correct
    if (isCorrect) {
      await gamificationService.rewardUser(
        tx,
        userId,
        'QUIZ_PASSED',
        `Answered quiz correctly for question: ${quiz.question}`,
        quiz.points,
        quiz.coins
      );
    }

    return {
      isCorrect,
      userQuiz,
      message: isCorrect ? 'Correct! Rewards granted.' : 'Incorrect answer. Better luck next time!'
    };
  });
};

module.exports = {
  getAllQuizzes,
  createQuiz,
  answerQuiz
};
