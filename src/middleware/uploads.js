const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuring Multer for local file storage
// -- Export ready-to-use middleware for Express routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath); // * Automatically create the `uploads` folder if it does not exist
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // * Rename each file with a unique suffix to avoid collisions.
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

module.exports = multer({ storage });
