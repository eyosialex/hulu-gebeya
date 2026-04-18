const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const upload = require('../../middleware/upload.middleware');
const protect = require('../../middleware/auth.middleware');

// Accept a single file named 'image'
router.post('/', protect, upload.single('image'), uploadController.uploadImage);

module.exports = router;
