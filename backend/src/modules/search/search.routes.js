const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');

// Public route for semantic RAG search
router.post('/rag', searchController.search);

module.exports = router;
