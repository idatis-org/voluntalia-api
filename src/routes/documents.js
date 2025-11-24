const express = require('express');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/uploads');
const {
  saveDocument,
  downloadDocument,
} = require('../controllers/documentController');

const router = express.Router();

// * Upload and persist a single document (authenticated users only)
router.post('/', requireAuth, upload.single('file'), saveDocument);

// * Download an existing document by ID
router.get('/:id/download', requireAuth, downloadDocument);

module.exports = router;
