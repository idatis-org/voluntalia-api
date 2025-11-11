const express = require('express');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/uploads');
const { saveDocument, downloadDocument, getCategories, getTypes, getAllDocuments } = require('../controllers/documentController');

const router = express.Router();

router.get('/', requireAuth, getAllDocuments);
// * Upload and persist a single document (authenticated users only)
// * With query param `folder` to specify a subfolder within the uploads directory
router.post('/upload',
  requireAuth,
  (req, res, next) => { req.customFolder = req.query.folder; next(); },
  upload.single('file'),
  saveDocument
);

// * Download an existing document by ID
router.get('/:id/download', requireAuth, downloadDocument);

// /* Fetch document categories and types (authenticated users only)
router.get('/categories', requireAuth, getCategories);
router.get('/types', requireAuth, getTypes);  

module.exports = router;