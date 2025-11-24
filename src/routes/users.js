const express = require('express');
const { pool } = require('../db/pool');
const { User, RefreshToken } = require('../models');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const { getAllUsers } = require('../controllers/userController');
const roles = require('../constants/roles');

const router = express.Router();

/**
 * List of users (COORDINATOR only).
 * This path will serve as the basis for the coordinator's future volunteer page.
 */

router.get('/', requireAuth, authorizeRoles(roles.COORDINATOR), getAllUsers);

module.exports = router;
