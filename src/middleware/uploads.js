const multer = require('multer');
const path   = require('path');
const fs = require('fs');


// Configuring Multer for local file storage
// -- Export ready-to-use middleware for Express routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'C:/tmp/files'//path.join(__dirname, '../../uploads');
    const sub = req.customFolder || 'misc';
    const fullPath = path.join(uploadPath, sub);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, {recursive: true}); // * Automatically create the `uploads` folder if it does not exist
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // * Rename each file with a unique suffix to avoid collisions.
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

module.exports = multer({storage});