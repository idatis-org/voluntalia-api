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

// * Only accept common document/image types used for volunteer resources
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const err = new Error(`Unsupported file type: ${file.mimetype}`);
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});