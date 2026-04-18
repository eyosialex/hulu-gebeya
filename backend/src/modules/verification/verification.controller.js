const verificationService = require('./verification.service');

const verifyLocation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await verificationService.submitVerification(req.body, userId);

    res.json({
      message: 'Verification submitted successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyLocation
};
