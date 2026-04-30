const aiVerificationService = require('./ai_verification.service');

const triggerAiVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { userLat, userLng, isSimulator } = req.body;
    const verificationImage = req.file;
    
    // Process heavy AI vision task
    const result = await aiVerificationService.runAiVerification(
      id, 
      userId, 
      parseFloat(userLat), 
      parseFloat(userLng), 
      verificationImage,
      isSimulator === 'true' || isSimulator === true
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerAiVerification
};
