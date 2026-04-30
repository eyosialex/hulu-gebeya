const verificationService = require('./verification.service');

const verifyLocation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const locationId = req.params.id; // Correctly taking it from URL params per documentation
    const data = { ...req.body, locationId }; // Merge it into data for the service

    const result = await verificationService.submitVerification(data, userId);

    res.json({
      message: 'Verification submitted successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};

const getVerifications = async (req, res, next) => {
  try {
    const locationId = req.params.id;
    const verifications = await verificationService.getVerificationsByLocation(locationId);
    res.json(verifications);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyLocation,
  getVerifications
};
