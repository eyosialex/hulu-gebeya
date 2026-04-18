const prisma = require('../../prisma/client');
const gamificationService = require('../gamification/gamification.service');


const createLocation = async (data, userId) => {
  const { name, description, category, latitude, longitude, imageUrl } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Create Location
    const location = await tx.location.create({
      data: {
        name,
        description,
        category,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl,
        createdById: userId
      }
    });

    // 2. Reward User via Gamification Module
    await gamificationService.rewardUser(tx, userId, 'LOCATION_CREATED', `Added new location: ${name}`, 20, 10);

    return location;
  });
};

const getAllLocations = async (filters = {}) => {
  const locations = await prisma.location.findMany({
    where: filters,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          reputationScore: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return locations;
};

const getLocationById = async (id) => {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          reputationScore: true
        }
      },
      verifications: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!location) {
    throw new Error('Location not found');
  }

  return location;
};

const updateLocation = async (id, data, userId, userRole) => {
  // Check if location exists
  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Location not found');
  }

  // Only the creator or an ADMIN can update
  if (existing.createdById !== userId && userRole !== 'ADMIN') {
    const error = new Error('Forbidden: you can only update your own locations');
    error.status = 403;
    throw error;
  }

  const location = await prisma.location.update({
    where: { id },
    data
  });

  return location;
};

const deleteLocation = async (id, userId, userRole) => {
  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Location not found');
  }

  // Only ADMIN can delete
  if (userRole !== 'ADMIN') {
    const error = new Error('Forbidden: only admins can delete locations');
    error.status = 403;
    throw error;
  }

  await prisma.location.delete({ where: { id } });
  return { message: 'Location deleted successfully' };
};

const getNearbyLocations = async (lat, lng, radiusKm) => {
  // Haversine formula via raw SQL for accurate distance calculation
  const locations = await prisma.$queryRawUnsafe(`
    SELECT id, name, description, category, latitude, longitude, "imageUrl",
           "verificationScore", status, "createdAt",
           ( 6371 * acos(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
           )) AS distance
    FROM "Location"
    WHERE ( 6371 * acos(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
           )) <= $3
    ORDER BY distance ASC
    LIMIT 50
  `, lat, lng, radiusKm);

  return locations;
};

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getNearbyLocations
};
