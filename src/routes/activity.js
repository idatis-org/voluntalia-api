const express = require('express');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const { create, getAllActivities, update, deleteActivity, assignActivity, getVolunteersByActivity, unassignActivity } = require('../controllers/activityController');
const roles = require('../constants/roles');

const router = express.Router();

// ! Coordinator-only: create a new activity
router.post('/create', requireAuth, authorizeRoles(roles.COORDINATOR), create);

// * Fetch all activities (any authenticated user)
router.get('/', requireAuth, getAllActivities);

// ! Coordinator-only: update an existing activity
router.put('/:id', requireAuth, authorizeRoles(roles.COORDINATOR), update);

// ! Coordinator-only: delete an activity
router.delete('/:id', requireAuth, authorizeRoles(roles.COORDINATOR), deleteActivity);

// ! Coordinator-only: assign a volunteer to an activity
router.post('/:id/assign', requireAuth, authorizeRoles(roles.COORDINATOR), assignActivity);

// ! Coordinator-only: remove a volunteer from an activity
router.post('/:id/unassign', requireAuth, authorizeRoles(roles.COORDINATOR), unassignActivity);

// * List all volunteers for a specific activity
router.get('/:id/volunteers', requireAuth, getVolunteersByActivity);

module.exports = router;