const express = require('express');
const { User, RefreshToken } = require('../models');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updatePreferencesSchema } = require('../validators/preferencesValidators');
const { getAllUsers, updateUser, toggleUserStatus } = require('../controllers/userController');
const { getMine, updateMine } = require('../controllers/preferencesController');
const roles = require('../constants/roles');

const router = express.Router();

/**
 * List of users (COORDINATOR only).
 * This path will serve as the basis for the coordinator's future volunteer page.
 */

router.get('/', requireAuth, authorizeRoles(roles.COORDINATOR), getAllUsers);

/**
 * Get/update the authenticated user's own preferences.
 */
router.get('/me/preferences', requireAuth, getMine);
router.put('/me/preferences', requireAuth, validate(updatePreferencesSchema), updateMine);

/**
 * Update user by ID (COORDINATOR only).
 */
router.put('/:id', requireAuth, authorizeRoles(roles.COORDINATOR), updateUser);

/**
 * Toggle user active status (COORDINATOR only).
 * Deactivates active users, activates inactive users.
 */
router.patch('/:id/toggle-status', requireAuth, authorizeRoles(roles.COORDINATOR), toggleUserStatus);

module.exports = router;
