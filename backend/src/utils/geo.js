// backend/src/utils/geo.js

/**
 * Calculates the Haversine distance between two points on Earth in meters.
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Asserts that the user is within a maxDistance of the target coordinates.
 * Throws an error if they are too far.
 */
const assertUserNearLocation = (userLat, userLng, targetLat, targetLng, maxDistance = 100) => {
  if (userLat === undefined || userLng === undefined) {
    throw new Error('User coordinates (lat/lng) are required for verification');
  }

  const distance = calculateDistance(userLat, userLng, targetLat, targetLng);
  
  if (distance > maxDistance) {
    throw new Error(`User too far from target (${Math.round(distance)}m > ${maxDistance}m). Verification denied.`);
  }

  return distance;
};

/**
 * Validates movement velocity between the last reported activity and current activity.
 * Returns metadata about the movement or flags it as invalid.
 */
const validateMovement = (lastActivity, currentLat, currentLng) => {
  // If no previous telemetry is available, skip the velocity check.
  if (!lastActivity || lastActivity.latitude === null || lastActivity.longitude === null) {
    return { valid: true };
  }

  const distance = calculateDistance(
    lastActivity.latitude, 
    lastActivity.longitude, 
    currentLat, 
    currentLng
  );
  
  const timeDiffSeconds = (Date.now() - new Date(lastActivity.createdAt).getTime()) / 1000;
  
  // Rate Limiting / Anti-Spam: Block requests faster than 2 seconds apart
  if (timeDiffSeconds < 2) {
    return { valid: false, reason: 'TOO_FAST_REQUEST' };
  }

  const velocityMs = distance / timeDiffSeconds;
  const velocityKmh = velocityMs * 3.6;

  // MALICIOUS CHECK: 
  // Flag if user moved > 300km/h and the distance is significant (>500m)
  // This helps ignore GPS jitter for stationary users.
  if (velocityKmh > 300 && distance > 500) {
    return { 
      valid: false, 
      velocity: Math.round(velocityKmh), 
      distance: Math.round(distance),
      reason: 'TELEPORTATION_DETECTED'
    };
  }
  
  return { valid: true, velocity: velocityKmh, distance };
};

module.exports = { 
  calculateDistance, 
  assertUserNearLocation, 
  validateMovement 
};
