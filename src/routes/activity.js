const express = require('express');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const {
  create,
  getAllActivities,
  update,
  deleteActivity,
  assignActivity,
  getVolunteersByActivity,
  unassignActivity,
} = require('../controllers/activityController');
const roles = require('../constants/roles');

const router = express.Router();

// Create a new activity (coordinator or project manager for their project)
router.post('/create', requireAuth, create);

// * Fetch all activities (any authenticated user)
router.get('/', requireAuth, getAllActivities);

// ! Coordinator-only: update an existing activity
router.put('/:id', requireAuth, authorizeRoles(roles.COORDINATOR), update);

// ! Coordinator-only: delete an activity
router.delete(
  '/:id',
  requireAuth,
  authorizeRoles(roles.COORDINATOR),
  deleteActivity
);

// Assign a volunteer to an activity (coordinator or project manager for the activity's project)
router.post('/:id/assign', requireAuth, assignActivity);

// Remove a volunteer from an activity (coordinator or project manager for the activity's project)
router.post('/:id/unassign', requireAuth, unassignActivity);

// * List all volunteers for a specific activity
router.get('/:id/volunteers', requireAuth, getVolunteersByActivity);

module.exports = router;
