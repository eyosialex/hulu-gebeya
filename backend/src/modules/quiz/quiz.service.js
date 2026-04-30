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

const answerQuiz = async (quizId, userId, providedAnswer, timeTaken) => {
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
  
  // Speed Bonus: 50% extra if under 10 seconds
  const isFast = timeTaken && timeTaken <= 10;
  const finalPoints = isCorrect ? (isFast ? Math.floor(quiz.points * 1.5) : quiz.points) : 0;
  const finalCoins = isCorrect ? (isFast ? Math.floor(quiz.coins * 1.5) : quiz.coins) : 0;

  return await prisma.$transaction(async (tx) => {
    // Record attempt
    const userQuiz = await tx.userQuiz.create({
      data: {
        userId,
        quizId,
        isCorrect,
        timeTaken
      }
    });

    // Reward if correct
    if (isCorrect) {
      const detail = isFast 
        ? `Answered quiz correctly in ${timeTaken}s (Speed Bonus!)`
        : `Answered quiz correctly`;

      await gamificationService.rewardUser(
        tx,
        userId,
        'QUIZ_PASSED',
        detail,
        finalPoints,
        finalCoins
      );
    }

    return {
      isCorrect,
      isFast,
      userQuiz,
      message: isCorrect 
        ? (isFast ? 'Lightning Fast! Correct answer with 50% Speed Bonus.' : 'Correct! Rewards granted.')
        : 'Incorrect answer. Better luck next time!'
    };
  });
};

module.exports = {
  getAllQuizzes,
  createQuiz,
  answerQuiz
};
