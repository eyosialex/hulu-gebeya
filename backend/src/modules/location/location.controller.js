const locationService = require('./location.service');

const createLocation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Map frontend 'tip' naming convention to backend 'description'
    if (req.body.tip && !req.body.description) {
      req.body.description = req.body.tip;
    }
    
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

const getNearbyLocations = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 5;

    const locations = await locationService.getNearbyLocations(lat, lng, radius);
    res.json(locations);
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const location = await locationService.updateLocation(id, req.body, userId, userRole);
    res.json({
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const result = await locationService.deleteLocation(id, userId, userRole);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById,
  getNearbyLocations,
  updateLocation,
  deleteLocation
};
