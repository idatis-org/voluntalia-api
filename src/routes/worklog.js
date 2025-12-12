const express = require('express');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const { create, me, getWorkByUser, deleteWorklog, update } = require('../controllers/worklogController');
const roles = require('../constants/roles');

const router = express.Router();

// * Log new work entry (own record)
router.post('/create', requireAuth, create);

// Approve/unapprove worklogs
router.post('/:id/approve', requireAuth, require('../controllers/worklogController').approve);
router.post('/:id/unapprove', requireAuth, require('../controllers/worklogController').unapprove);

// * Fetch current user's own worklogs
router.get('/me', requireAuth, me);

// ! Coordinator-only: view any user's worklogs
router.get('/user/:id', requireAuth, authorizeRoles(roles.COORDINATOR), getWorkByUser);

// ? Delete own worklog entry
router.delete('/:id', requireAuth, deleteWorklog);

// ? Update own worklog entry
router.put('/:id', requireAuth, update);

module.exports = router;