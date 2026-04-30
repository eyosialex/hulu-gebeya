const prisma = require('../../prisma/client');

/**
 * Updates user settings and profile metadata.
 * Uses strict property mapping to prevent accidental overrides of restricted fields (like role).
 */
const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { displayName, city, bio } = req.body;

    const updateData = {};
    if (displayName) updateData.name = displayName;
    if (city) updateData.city = city;
    if (bio) updateData.bio = bio;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        bio: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateSettings
};
