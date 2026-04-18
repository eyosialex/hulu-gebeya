const prisma = require('../../prisma/client');

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

    // 4. Reward the Voter (Only for new verifications would be ideal, but here we reward for interaction)
    await tx.user.update({
      where: { id: userId },
      data: {
        points: { increment: 5 },
        coins: { increment: 2 }
      }
    });

    // 5. Update Creator Reputation (If location is being upvoted)
    if (vote === 'UP') {
      await tx.user.update({
        where: { id: updatedLocation.createdById },
        data: { reputationScore: { increment: 0.1 } }
      });
    }

    // 6. Log Activity
    await tx.activityLog.create({
      data: {
        userId,
        action: 'LOCATION_VERIFIED',
        details: `Verified location: ${updatedLocation.name} with a ${vote} vote`,
        points: 5,
        coins: 2
      }
    });

    return verification;
  });
};

module.exports = {
  submitVerification
};
