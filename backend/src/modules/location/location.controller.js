const locationService = require('./location.service');

const createLocation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const location = await locationService.createLocation(req.body, userId);

    res.status(201).json({
      message: 'Location submitted for verification',
      location
    });
  } catch (error) {
    next(error);
  }
};

const getAllLocations = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;

    const locations = await locationService.getAllLocations(filters);
    res.json(locations);
  } catch (error) {
    next(error);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await locationService.getLocationById(id);
    res.json(location);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById
};
