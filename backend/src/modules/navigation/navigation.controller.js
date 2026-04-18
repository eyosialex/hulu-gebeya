const navigationService = require('./navigation.service');

const getRoute = async (req, res, next) => {
  try {
    const { originLat, originLng, destinationLat, destinationLng, waypoints } = req.body;
    
    // Fallback to query params if it's a GET request without a body
    const oLat = parseFloat(originLat || req.query.originLat);
    const oLng = parseFloat(originLng || req.query.originLng);
    const dLat = parseFloat(destinationLat || req.query.destinationLat);
    const dLng = parseFloat(destinationLng || req.query.destinationLng);
    const wPoints = waypoints ? waypoints : [];

    const route = await navigationService.calculateRoute(oLat, oLng, dLat, dLng, wPoints);
    res.json(route);
  } catch (error) {
    next(error);
  }
};

const saveRoute = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const route = await navigationService.saveRoute(req.body, userId);
    
    res.status(201).json({
      message: 'Route saved successfully',
      route
    });
  } catch (error) {
    next(error);
  }
};

const getSavedRoutes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const routes = await navigationService.getSavedRoutes(userId);
    res.json(routes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoute,
  saveRoute,
  getSavedRoutes
};
