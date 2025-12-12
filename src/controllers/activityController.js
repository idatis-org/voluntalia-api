const activityService = require('../services/activityService');
const { Project, Activity } = require('../models');
const roles = require('../constants/roles');

// Create a new activity
exports.create = async (req, res, next) => {
  try {
    const { title, description, date, project_id } = req.body;
    const sub = req.user.sub;

    if (!title || !date) return res.status(400).json({ error: 'title and date are required' });

    const isCoordinator = req.user.role === roles.COORDINATOR;
    const isProjectManager = req.user.role === roles.PROJECT_MANAGER;

    if (isCoordinator) {
      const activity = await activityService.create(title, description, date, sub, project_id);
      return res.status(201).json({ activity });
    }

    if (isProjectManager) {
      if (!project_id) return res.status(403).json({ error: 'project_id required for project managers' });
      const project = await Project.findByPk(project_id);
      if (!project) return res.status(404).json({ error: 'project not found' });
      if (project.manager_id !== sub) return res.status(403).json({ error: 'forbidden' });

      const activity = await activityService.create(title, description, date, sub, project_id);
      return res.status(201).json({ activity });
    }

    return res.status(403).json({ error: 'forbidden' });
  } catch (err) {
    next(err);
  }
};

// * Fetch all activities (any authenticated user)
exports.getAllActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getAll();
    res.status(201).json({ activities });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: update an existing activity
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;

    await activityService.update(title, description, date, id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: delete an activity
exports.deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    await activityService.deleteActivity(id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: assign a volunteer to an activity
exports.assignActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const { volunteer_id } = req.body;
    if (!volunteer_id) return res.status(400).json({ error: 'volunteer_id required' });

    const activity = await Activity.findByPk(id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });

    const isCoordinator = req.user.role === roles.COORDINATOR;
    const isProjectManager = req.user.role === roles.PROJECT_MANAGER;

    if (isCoordinator) {
      await activityService.assignActivity(id, volunteer_id);
      return res.status(201).json({ ok: true });
    }

    if (isProjectManager) {
      if (!activity.project_id) return res.status(403).json({ error: 'activity not linked to a project' });
      const project = await Project.findByPk(activity.project_id);
      if (!project) return res.status(404).json({ error: 'project not found' });
      if (project.manager_id !== req.user.sub) return res.status(403).json({ error: 'forbidden' });

      await activityService.assignActivity(id, volunteer_id);
      return res.status(201).json({ ok: true });
    }

    return res.status(403).json({ error: 'forbidden' });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: remove a volunteer from an activity
exports.unassignActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const { volunteer_id } = req.body;
    if (!volunteer_id) return res.status(400).json({ error: 'volunteer_id required' });

    const activity = await Activity.findByPk(id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });

    const isCoordinator = req.user.role === roles.COORDINATOR;
    const isProjectManager = req.user.role === roles.PROJECT_MANAGER;

    if (isCoordinator) {
      await activityService.unassignActivity(id, volunteer_id);
      return res.status(201).json({ ok: true });
    }

    if (isProjectManager) {
      if (!activity.project_id) return res.status(403).json({ error: 'activity not linked to a project' });
      const project = await Project.findByPk(activity.project_id);
      if (!project) return res.status(404).json({ error: 'project not found' });
      if (project.manager_id !== req.user.sub) return res.status(403).json({ error: 'forbidden' });

      await activityService.unassignActivity(id, volunteer_id);
      return res.status(201).json({ ok: true });
    }

    return res.status(403).json({ error: 'forbidden' });
  } catch (err) {
    next(err);
  }
};

// * List all volunteers assigned to a specific activity
exports.getVolunteersByActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const users = await activityService.getVolunteersByActivity(id);
    res.status(201).json({ users });
  } catch (err) {
    next(err);
  }
};
