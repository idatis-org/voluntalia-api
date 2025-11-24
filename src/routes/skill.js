const express = require('express');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const { create, getAllSkills, update, deleteSkill, assignSkill, unassignSkill } = require('../controllers/skillController');
//, getAllActivities, update, deleteActivity, assignActivity, getVolunteersByActivity, unassignActivity
const roles = require('../constants/roles');

const router = express.Router();

router.post('/create', requireAuth, authorizeRoles(roles.COORDINATOR), create);

router.get('/', getAllSkills);

router.put('/update/:id', requireAuth, authorizeRoles(roles.COORDINATOR), update);

router.delete('/delete/:id', requireAuth, authorizeRoles(roles.COORDINATOR), deleteSkill);

router.post('/:id/assign', requireAuth, authorizeRoles(roles.COORDINATOR),assignSkill);

router.post('/:id/unassign', requireAuth, authorizeRoles(roles.COORDINATOR),unassignSkill);

module.exports = router;