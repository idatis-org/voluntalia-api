const express = require('express');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const roles = require('../constants/roles');
const controller = require('../controllers/projectController');

const router = express.Router();

// Create project (coordinator or project manager)
router.post('/create', requireAuth, authorizeRoles(roles.COORDINATOR), controller.create);

// List projects (any authenticated user)
router.get('/', requireAuth, controller.getAll);

// Get project by id
router.get('/:id', requireAuth, controller.getById);

// List activities for a specific project
router.get('/:id/activities', requireAuth, controller.getActivitiesByProject);

// List volunteers for a specific project (paginated)
router.get('/:id/volunteers', requireAuth, controller.getVolunteersByProject);
// Update project (coordinator or project manager) - manager check in controller
router.put('/:id', requireAuth, controller.update);

// Delete project (coordinator only)
router.delete('/:id', requireAuth, authorizeRoles(roles.COORDINATOR), controller.delete);

// Add volunteer to project (coordinator or project manager)
router.post('/:id/volunteers', requireAuth, controller.addVolunteer);

// Remove volunteer from project (coordinator or project manager)
router.delete('/:id/volunteers/:user_id', requireAuth, controller.removeVolunteer);

// Assign/unassign activity to project (coordinator or activity creator) - controller handles checks
router.put('/activities/:id/project', requireAuth, controller.assignActivity);

module.exports = router;
