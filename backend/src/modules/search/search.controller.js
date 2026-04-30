const searchService = require('./search.service');

const search = async (req, res, next) => {
  try {
    const { query, userLat, userLng } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Default to search without geofencing if coords are missing, 
    // though service is now optimized for their presence.
    const result = await searchService.ragSearch(query, userLat, userLng);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  search
};
