const aiVerificationService = require('./ai_verification.service');

const triggerAiVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Process heavy AI vision task
    const result = await aiVerificationService.runAiVerification(id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerAiVerification
};
