const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

const router = express.Router();

// * Get dashboard statistics (accessible to all authenticated users)
router.get('/stats', requireAuth, getStats);

module.exports = router;
