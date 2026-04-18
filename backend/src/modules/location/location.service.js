const prisma = require('../../prisma/client');

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

    // 2. Reward User
    await tx.user.update({
      where: { id: userId },
      data: {
        points: { increment: 20 },
        coins: { increment: 10 }
      }
    });

    // 3. Log Activity
    await tx.activityLog.create({
      data: {
        userId,
        action: 'LOCATION_CREATED',
        details: `Added new location: ${name}`,
        points: 20,
        coins: 10
      }
    });

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

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById
};
