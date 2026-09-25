const express = require('express');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createWorklogSchema, updateWorklogSchema, updateStatusSchema } = require('../validators/worklogValidators');
const { create, me, getWorkByUser, deleteWorklog, update, updateStatus } = require('../controllers/worklogController');
const roles = require('../constants/roles');

const router = express.Router();

// * Log new work entry (own record)
router.post('/create', requireAuth, validate(createWorklogSchema), create);

// * Fetch current user's own worklogs
router.get('/me', requireAuth, me);

// ! Coordinator-only: view any user's worklogs
router.get('/user/:id', requireAuth, authorizeRoles(roles.COORDINATOR), getWorkByUser);

// ? Delete own worklog entry
router.delete('/:id', requireAuth, deleteWorklog);

// ? Update own worklog entry
router.put('/:id', requireAuth, validate(updateWorklogSchema), update);

// ! Coordinator-only: approve or reject a worklog entry
router.patch('/:id/status', requireAuth, authorizeRoles(roles.COORDINATOR), validate(updateStatusSchema), updateStatus);

module.exports = router;