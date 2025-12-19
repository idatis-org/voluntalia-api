const { Project, User, Activity } = require('../models');
const { Op } = require('sequelize');
const SequelizeLib = require('sequelize');
const { NotFoundError, ConflictError } = require('../errors/errorTypes');

// Create a new project
exports.create = async ({ name, description, manager_id, start_date, end_date, created_by, status }) => {
  // if manager_id provided, ensure manager exists and has correct role
  if (manager_id) {
    const manager = await User.findByPk(manager_id);
    if (!manager) throw new NotFoundError('Manager user not found');

    if (!['PROJECT_MANAGER', 'COORDINATOR'].includes(manager.role)) {
      throw new ConflictError('Assigned manager must have role PROJECT_MANAGER or COORDINATOR');
    }
  }

  // ensure creator exists
  const creator = await User.findByPk(created_by);
  if (!creator) throw new NotFoundError('Creator user not found');

  const project = await Project.create({ name, description, manager_id: manager_id || null, start_date, end_date, created_by, status });
  return project;
};

// Get all projects with summary info (supports pagination)
// options: { page, per_page }
exports.getAll = async (options = {}) => {
  const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  let per_page = parseInt(options.per_page, 10) > 0 ? parseInt(options.per_page, 10) : 20;
  const MAX_PER_PAGE = 100;
  if (per_page > MAX_PER_PAGE) per_page = MAX_PER_PAGE;
  const offset = (page - 1) * per_page;

  // Build where filters
  const where = {};
  if (options.q) {
    const q = String(options.q).trim();
    if (q.length) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }
  }
  if (options.manager_id) {
    where.manager_id = options.manager_id;
  }
  if (options.start_date_from) {
    where.start_date = where.start_date || {};
    where.start_date[Op.gte] = options.start_date_from;
  }
  if (options.start_date_to) {
    where.start_date = where.start_date || {};
    where.start_date[Op.lte] = options.start_date_to;
  }

  // Parse include param early
  const includeCsv = String(options.include || '');
  const includeParts = includeCsv.split(',').map(p => p.trim()).filter(Boolean);

  // Build includes; by default include only manager to keep payload small.
  const includes = [ { model: User, as: 'manager', attributes: ['id', 'name', 'email'] } ];
  // allow optional includes
  if (includeParts.includes('volunteers')) {
    includes.push({ association: 'volunteers', attributes: ['id', 'name', 'email'], through: { attributes: [] } });
  }
  if (includeParts.includes('activities')) {
    includes.push({ model: Activity, as: 'activities', attributes: ['id'] });
  }

  // If caller requested counts, add literal attributes for volunteers_count and activities_count
  const attributes = { include: [] };
  if (includeParts.includes('counts')) {
    attributes.include.push([
      SequelizeLib.literal(`(
        SELECT COUNT(*) FROM project_volunteers pv WHERE pv.project_id = "Project"."id"
      )`),
      'volunteers_count'
    ]);
    attributes.include.push([
      SequelizeLib.literal(`(
        SELECT COUNT(*) FROM activities a WHERE a.project_id = "Project"."id"
      )`),
      'activities_count'
    ]);
  }

  const result = await Project.findAndCountAll({
    distinct: true,
    col: 'id',
    where,
    limit: per_page,
    offset,
    attributes: attributes.include.length ? attributes : undefined,
    include: includes,
    order: [['created_at', 'DESC']]
  });

  const projects = result.rows.map(r => r.toJSON());
  const total = parseInt(result.count, 10) || 0;
  const total_pages = Math.ceil(total / per_page) || 1;

  return {
    projects,
    meta: { page, per_page, total, total_pages }
  };
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

  const allowed = ['name', 'description', 'manager_id', 'start_date', 'end_date', 'status'];
  const payload = {};
  allowed.forEach((k) => { if (data[k] !== undefined) payload[k] = data[k]; });

  // if manager_id provided, ensure user exists and actor is allowed to change it
  if (payload.manager_id !== undefined) {
    // if manager_id is being set to non-null, validate existence and role
    if (payload.manager_id !== null) {
      const manager = await User.findByPk(payload.manager_id);
      if (!manager) throw new NotFoundError('Manager user not found');

      // ensure new manager has appropriate role
      if (!['PROJECT_MANAGER', 'COORDINATOR'].includes(manager.role)) {
        throw new ConflictError('Assigned manager must have role PROJECT_MANAGER or COORDINATOR');
      }
    }

    // if manager is actually changing, only current manager or coordinator may do it
    if (payload.manager_id !== project.manager_id) {
      const isCoordinator = actor.role === 'COORDINATOR';
      const isCurrentManager = actor.id === project.manager_id;
      if (!isCoordinator && !isCurrentManager) throw new ConflictError('Only project manager or coordinator can change project manager');
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

// Get paginated volunteers for a project
exports.getVolunteers = async (projectId, options = {}) => {
  const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  let per_page = parseInt(options.per_page, 10) > 0 ? parseInt(options.per_page, 10) : 20;
  const MAX_PER_PAGE = 100;
  if (per_page > MAX_PER_PAGE) per_page = MAX_PER_PAGE;
  const offset = (page - 1) * per_page;

  const project = await Project.findByPk(projectId);
  if (!project) throw new NotFoundError('Project not found');

  // build user where clause
  const where = {};
  if (options.q) {
    const q = String(options.q).trim();
    if (q.length) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } }
      ];
    }
  }

  const total = await project.countVolunteers({ where });
  const volunteers = await project.getVolunteers({ where, limit: per_page, offset, attributes: ['id', 'name', 'email'], joinTableAttributes: [] });

  const volunteersJson = volunteers.map(v => v.toJSON());
  const total_pages = Math.ceil(total / per_page) || 1;

  return {
    volunteers: volunteersJson,
    meta: { page, per_page, total, total_pages }
  };
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
