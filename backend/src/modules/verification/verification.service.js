const prisma = require('../../prisma/client');
const gamificationService = require('../gamification/gamification.service');

const submitVerification = async (data, userId) => {
  const { locationId, vote, confidence } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Create/Update the verification
    const verification = await tx.verification.upsert({
      where: {
        userId_locationId: {
          userId,
          locationId
        }
      },
      update: {
        vote,
        confidence
      },
      create: {
        locationId,
        userId,
        vote,
        confidence
      }
    });

    // 2. Recalculate location score
    const verifications = await tx.verification.findMany({
      where: { locationId }
    });

    const upVotes = verifications.filter(v => v.vote === 'UP').length;
    const downVotes = verifications.filter(v => v.vote === 'DOWN').length;
    const newScore = upVotes - downVotes;

    // 3. Update Location status and score
    const updatedLocation = await tx.location.update({
      where: { id: locationId },
      data: {
        verificationScore: newScore,
        status: newScore >= 5 ? 'APPROVED' : (newScore <= -5 ? 'REJECTED' : 'PENDING')
      }
    });

    // 4. Reward the Voter via Gamification Module
    await gamificationService.rewardUser(tx, userId, 'LOCATION_VERIFIED', `Verified location: ${updatedLocation.name} with a ${vote} vote`, 5, 2);

    // 5. Update Creator Reputation (If location is being upvoted)
    if (vote === 'UP') {
      await tx.user.update({
        where: { id: updatedLocation.createdById },
        data: { reputationScore: { increment: 0.1 } }
      });
    }



    return verification;
  });
};

const getVerificationsByLocation = async (locationId) => {
  return await prisma.verification.findMany({
    where: { locationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          reputationScore: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

module.exports = {
  submitVerification,
  getVerificationsByLocation
};
