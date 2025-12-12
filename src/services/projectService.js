const { Project, User, Activity } = require('../models');
const { NotFoundError, ConflictError } = require('../errors/errorTypes');

// Create a new project
exports.create = async ({ name, description, manager_id, start_date, end_date, created_by }) => {
  // ensure manager exists
  const manager = await User.findByPk(manager_id);
  if (!manager) throw new NotFoundError('Manager user not found');

  // ensure creator exists
  const creator = await User.findByPk(created_by);
  if (!creator) throw new NotFoundError('Creator user not found');

  const project = await Project.create({ name, description, manager_id, start_date, end_date, created_by });
  return project;
};

// Get all projects with summary info
exports.getAll = async () => {
  return await Project.findAll({
    include: [
      { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
      { association: 'volunteers', attributes: ['id', 'name', 'email'], through: { attributes: [] } },
      { model: Activity, as: 'activities', attributes: ['id'] }
    ],
    order: [['created_at', 'DESC']]
  });
};

// Get one project by id
exports.getById = async (id) => {
  const project = await Project.findByPk(id, {
    include: [
      { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
      { association: 'volunteers', attributes: ['id', 'name', 'email'], through: { attributes: [] } },
      { model: Activity, as: 'activities', attributes: ['id', 'title'] }
    ]
  });
  if (!project) throw new NotFoundError('Project not found');
  return project;
};

// Update project
exports.update = async (id, data) => {
  const project = await Project.findByPk(id);
  if (!project) throw new NotFoundError('Project not found');

  const allowed = ['name', 'description', 'manager_id', 'start_date', 'end_date'];
  const payload = {};
  allowed.forEach((k) => { if (data[k] !== undefined) payload[k] = data[k]; });

  // if manager_id provided, ensure user exists
  if (payload.manager_id) {
    const manager = await User.findByPk(payload.manager_id);
    if (!manager) throw new NotFoundError('Manager user not found');
  }

  await project.update(payload);
  return project;
};

// Delete project
exports.delete = async (id) => {
  const project = await Project.findByPk(id);
  if (!project) throw new NotFoundError('Project not found');
  await project.destroy();
};

// Add volunteer to project
exports.addVolunteer = async (projectId, userId, assignedBy) => {
  const project = await Project.findByPk(projectId);
  if (!project) throw new NotFoundError('Project not found');

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  await project.addVolunteer(userId, { through: { assigned_by: assignedBy } });
  return project;
};

// Remove volunteer from project
exports.removeVolunteer = async (projectId, userId) => {
  const project = await Project.findByPk(projectId);
  if (!project) throw new NotFoundError('Project not found');

  await project.removeVolunteer(userId);
  return project;
};

// Assign an activity to a project
exports.assignActivity = async (activityId, projectId) => {
  const activity = await Activity.findByPk(activityId);
  if (!activity) throw new NotFoundError('Activity not found');

  if (projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) throw new NotFoundError('Project not found');
  }

  await activity.update({ project_id: projectId || null });
  return activity;
};
