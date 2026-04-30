const navigationService = require('./navigation.service');

const getRoute = async (req, res, next) => {
  try {
    const source = req.method === 'GET' ? req.query : req.body || {};
    const { originLat, originLng, destinationLat, destinationLng, waypoints } = source;
    
    const oLat = parseFloat(originLat);
    const oLng = parseFloat(originLng);
    const dLat = parseFloat(destinationLat);
    const dLng = parseFloat(destinationLng);
    const wPoints = Array.isArray(waypoints) ? waypoints : [];

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
