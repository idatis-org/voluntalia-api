const express = require('express');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const {
  create,
  getAllActivities,
  getById,
  update,
  deleteActivity,
  assignActivity,
  getStats,
  getVolunteersByActivity,
  unassignActivity,
} = require('../controllers/activityController');
const roles = require('../constants/roles');

const router = express.Router();

// Create a new activity (coordinator or project manager for their project)
router.post('/create', requireAuth, create);

// Fetch all activities (any authenticated user - filtered by role)
router.get('/', requireAuth, getAllActivities);

// Aggregated statistics for activities (filters + permissions)
router.get('/stats', requireAuth, getStats);

// Get a single activity by id
router.get('/:id', requireAuth, getById);

// Update an existing activity (coordinator or project manager for their project)
router.put('/:id', requireAuth, update);

// Delete an activity (coordinator or project manager for their project)
router.delete('/:id', requireAuth, deleteActivity);

// Assign a volunteer to an activity (coordinator or project manager for the activity's project)
router.post('/:id/assign', requireAuth, assignActivity);

// Remove a volunteer from an activity (coordinator or project manager for the activity's project)
router.post('/:id/unassign', requireAuth, unassignActivity);

// List all volunteers for a specific activity
router.get('/:id/volunteers', requireAuth, getVolunteersByActivity);

module.exports = router;
