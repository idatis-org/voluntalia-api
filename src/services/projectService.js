const { Project, User, Activity } = require('../models');
const { NotFoundError, ConflictError } = require('../errors/errorTypes');

// Create a new project
exports.create = async ({ name, description, manager_id, start_date, end_date, created_by }) => {
  // ensure manager exists
  const manager = await User.findByPk(manager_id);
  if (!manager) throw new NotFoundError('Manager user not found');

  // manager must have appropriate role
  if (!['PROJECT_MANAGER', 'COORDINATOR'].includes(manager.role)) {
    throw new ConflictError('Assigned manager must have role PROJECT_MANAGER or COORDINATOR');
  }

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
exports.update = async (id, data, actor = {}) => {
  const project = await Project.findByPk(id);
  if (!project) throw new NotFoundError('Project not found');

  const allowed = ['name', 'description', 'manager_id', 'start_date', 'end_date'];
  const payload = {};
  allowed.forEach((k) => { if (data[k] !== undefined) payload[k] = data[k]; });

  // if manager_id provided, ensure user exists and actor is allowed to change it
  if (payload.manager_id !== undefined) {
    const manager = await User.findByPk(payload.manager_id);
    if (!manager) throw new NotFoundError('Manager user not found');

    // if manager is actually changing, only current manager or coordinator may do it
    if (payload.manager_id !== project.manager_id) {
      const isCoordinator = actor.role === 'COORDINATOR';
      const isCurrentManager = actor.id === project.manager_id;
      if (!isCoordinator && !isCurrentManager) throw new ConflictError('Only project manager or coordinator can change project manager');
    }
  }

  // ensure new manager has appropriate role
  if (payload.manager_id !== undefined) {
    const newManager = await User.findByPk(payload.manager_id);
    if (newManager && !['PROJECT_MANAGER', 'COORDINATOR'].includes(newManager.role)) {
      throw new ConflictError('Assigned manager must have role PROJECT_MANAGER or COORDINATOR');
    }
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
exports.addVolunteer = async (projectId, userId, assignedBy, actor = {}) => {
  const project = await Project.findByPk(projectId);
  if (!project) throw new NotFoundError('Project not found');

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  // prevent duplicate assignment
  const already = await project.hasVolunteer(userId);
  if (already) throw new ConflictError('User is already a volunteer of the project');

  // prevent adding inactive users
  if (!user.is_active) throw new ConflictError('Cannot add inactive user as volunteer');

  await project.addVolunteer(userId, { through: { assigned_by: assignedBy } });
  return project;
};

// Remove volunteer from project
exports.removeVolunteer = async (projectId, userId, actor = {}) => {
  const project = await Project.findByPk(projectId);
  if (!project) throw new NotFoundError('Project not found');

  const isVolunteer = await project.hasVolunteer(userId);
  if (!isVolunteer) throw new NotFoundError('User is not a volunteer of the project');

  // if this is the last volunteer, prevent removal unless coordinator
  const count = await project.countVolunteers();
  if (count <= 1 && actor.role !== 'COORDINATOR') throw new ConflictError('Cannot remove last volunteer from project');

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
    // Only coordinators or the activity creator may assign/unassign
    const isCoordinator = actor.role === 'COORDINATOR';
    const isCreator = actor.id === activity.created_by;
    if (!isCoordinator && !isCreator) throw new ConflictError('Only coordinator or activity creator can assign activity to a project');

    await activity.update({ project_id: projectId || null });
    return activity;
};
