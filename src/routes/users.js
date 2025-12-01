const express = require('express');
const { pool } = require('../db/pool');
const { User, RefreshToken } = require('../models');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const { getAllUsers, updateUser, toggleUserStatus } = require('../controllers/userController');
const roles = require('../constants/roles');

const router = express.Router();

/**
 * List of users (COORDINATOR only).
 * This path will serve as the basis for the coordinator's future volunteer page.
 */

router.get('/', requireAuth, authorizeRoles(roles.COORDINATOR), getAllUsers);

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
