const prisma = require('../../prisma/client');

/**
 * Calculates a route between points.
 * Note: In a full production environment, this integrates with external mapping APIs like Mapbox or Google Maps.
 * For this system architecture, it returns mathematical estimations.
 */
const calculateRoute = async (originLat, originLng, destinationLat, destinationLng, waypoints = []) => {
  // Naive Euclidean distance mapped roughly to kilometers
  const distanceEstimate = Math.sqrt(
    Math.pow(originLat - destinationLat, 2) + Math.pow(originLng - destinationLng, 2)
  ) * 111.0; 
  
  return {
    status: 'OK',
    estimatedDistanceKm: parseFloat(distanceEstimate.toFixed(2)),
    estimatedTimeMin: Math.round(distanceEstimate * 2), // Assuming ~30km/h urban average speed
    path: [
      { lat: originLat, lng: originLng },
      ...waypoints,
      { lat: destinationLat, lng: destinationLng }
    ]
  };
};

const saveRoute = async (data, userId) => {
  // Extract fields explicitly
  const { name, originLat, originLng, destinationLat, destinationLng, waypoints } = data;
  
  return await prisma.savedRoute.create({
    data: {
      name,
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      waypoints,
      userId
    }
  });
};

const getSavedRoutes = async (userId) => {
  return await prisma.savedRoute.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  calculateRoute,
  saveRoute,
  getSavedRoutes
};
