const searchService = require('./search.service');

const search = async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await searchService.ragSearch(query);

    res.json({
      query,
      result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  search
};
