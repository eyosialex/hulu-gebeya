const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Construct the public accessibility URL
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage
};
