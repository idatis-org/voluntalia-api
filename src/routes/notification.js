const express = require('express');
const { User, Notification } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { send, get, read } = require('../controllers/notificationController');

const router = express.Router();

/**
 * Ability to send notifications within the application
 */
router.post('/send', requireAuth, send);        // * Send notification
router.get('/', requireAuth, get);              // * Get notifications
router.patch('/:id/read', requireAuth, read);   // * Check notification as read

module.exports = router;