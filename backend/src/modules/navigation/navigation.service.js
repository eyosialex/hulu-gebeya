const prisma = require('../../prisma/client');

/**
 * Calculates a route between points using OSRM (Open Source Routing Machine).
 * Implements a high-fidelity road routing system with a Euclidean fallback for resilience.
 */
const calculateRoute = async (originLat, originLng, destinationLat, destinationLng, waypoints = []) => {
  try {
    // 1. Build OSRM coordinates string (OSRM expects [lng, lat] format)
    const coords = `${originLng},${originLat};${destinationLng},${destinationLat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM service unreachable');

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No valid road route found');
    }

    const route = data.routes[0];

    // 2. Extract professional metrics
    return {
      status: 'OK',
      source: 'OSRM_REAL_ROADS',
      estimatedDistanceKm: parseFloat((route.distance / 1000).toFixed(2)),
      estimatedTimeMin: Math.round(route.duration / 60),
      // Map OSRM [lng, lat] back to our [lat, lng] format for Leaflet
      path: route.geometry.coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      })),
      summary: route.legs[0]?.summary || 'Main Road'
    };

  } catch (error) {
    // 3. Resilient Fallback: Euclidean estimation
    console.warn(`Routing Warning: Falling back to Euclidean due to: ${error.message}`);
    
    const distanceEstimate = Math.sqrt(
      Math.pow(originLat - destinationLat, 2) + Math.pow(originLng - destinationLng, 2)
    ) * 111.0; 

    return {
      status: 'DEGRADED',
      warning: 'EXTERNAL_ROUTING_FAIL',
      source: 'EUCLIDEAN_ESTIMATION',
      estimatedDistanceKm: parseFloat(distanceEstimate.toFixed(2)),
      estimatedTimeMin: Math.round(distanceEstimate * 2),
      path: [
        { lat: originLat, lng: originLng },
        { lat: destinationLat, lng: destinationLng }
      ],
      message: 'Network error: Showing straight-line distance instead.'
    };
  }
};

const saveRoute = async (data, userId) => {
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
