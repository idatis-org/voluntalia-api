const { VOLUNTEER } = require('../constants/roles');
const { NotFoundError, BadRequestError } = require('../errors/errorTypes');
const { Activity, User, WorkLog, Project } = require('../models');
const sequelize = require('sequelize');

// * Create a new activity (coordinator or project manager when within project)
exports.create = async (title, description, date, sub, project_id = null) => {
  // Require project_id (model is NOT NULL now)
  if (!project_id) throw new BadRequestError('project_id is required');

  // Validate project existence and date constraint
  const project = await Project.findByPk(project_id);
  if (!project) throw new NotFoundError('project not found');

  const activityDate = new Date(date);
  const projectStart = project.start_date ? new Date(project.start_date) : null;
  if (projectStart && activityDate < projectStart) {
    throw new BadRequestError('activity start date must be >= project start date');
  }

  const payload = { title, description, date, created_by: sub, project_id };
  return await Activity.create(payload);
};

// * Fetch all activities with creator name and role-based filtering
exports.getAll = async (userId, userRole, userProjectId = null, userProjects = []) => {
  let whereCondition = {};

  // Role-based filtering for activities
  if (userRole === 'COORDINATOR') {
    // COORDINATOR sees all activities
    whereCondition = {};
  } else if (userRole === 'PROJECT_MANAGER') {
    // PROJECT_MANAGER sees only activities of their assigned project
    if (userProjectId) {
      whereCondition.project_id = userProjectId;
    } else {
      // If no project assigned, return empty list
      return [];
    }
  } else if (userRole === 'VOLUNTEER') {
    // VOLUNTEER sees only activities from projects they are part of
    if (userProjects.length > 0) {
      whereCondition.project_id = { [sequelize.Op.in]: userProjects };
    } else {
      // If no projects, return empty list
      return [];
    }
  } else {
    // Unknown role - return empty list
    return [];
  }

  const activities = await Activity.findAll({
    where: whereCondition,
    attributes: ['id', 'title', 'description', 'date', 'created_at', 'status', 'project_id'],
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id','name'],
      },
      {
        model: Project,
        as: 'project',
        attributes: ['id', 'name'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  // Calculate completed hours and user_hours (approved worklogs) for all fetched activities
  const activityIds = activities.map((a) => a.id).filter(Boolean);
  let completedMap = {};
  let userHoursMap = {};

  if (activityIds.length > 0) {
    // Get total completed hours per activity
    const completedSums = await WorkLog.findAll({
      attributes: [
        'activity_id',
        [sequelize.literal('SUM(EXTRACT(EPOCH FROM hours)) / 3600'), 'completedHours'],
      ],
      where: { status: 'approved', activity_id: activityIds },
      group: ['activity_id'],
      raw: true,
    });

    completedSums.forEach((s) => {
      completedMap[s.activity_id] = parseFloat(s.completedHours) || 0;
    });

    // Get user_hours (grouped by user) for each activity
    const userHours = await WorkLog.findAll({
      attributes: [
        'activity_id',
        'user_id',
        [sequelize.literal('SUM(EXTRACT(EPOCH FROM hours)) / 3600'), 'totalHours'],
      ],
      where: { status: 'approved', activity_id: activityIds },
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
          required: true,
        },
      ],
      group: ['activity_id', 'user_id', 'User.id', 'User.name'],
      raw: true,
      subQuery: false,
    });

    // Build user_hours map
    userHours.forEach((uh) => {
      if (!userHoursMap[uh.activity_id]) {
        userHoursMap[uh.activity_id] = [];
      }
      userHoursMap[uh.activity_id].push({
        user_id: uh.user_id,
        user_name: uh['User.name'],
        hours: parseFloat(uh.totalHours) || 0,
      });
    });
  }

  return activities.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    date: n.date,
    created_by: n.creator ? { id: n.creator.id, name: n.creator.name } : null,
    status: n.status,
    completed_hours: completedMap[n.id] ?? 0,
    project: n.project ? { id: n.project.id, name: n.project.name } : null,
    user_hours: userHoursMap[n.id] ?? [],
  }));
};

// Get all activities for a specific project in the same API format
exports.getActivitiesByProject = async (projectId) => {
  const activities = await Activity.findAll({
    where: { project_id: projectId },
    attributes: ['id', 'title', 'description', 'date', 'created_at', 'project_id', 'status'],
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name'] },
      { model: Project, as: 'project', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  });

  const activityIds = activities.map((a) => a.id).filter(Boolean);
  let completedMap = {};

  if (activityIds.length > 0) {
    const sums = await WorkLog.findAll({
      attributes: [
        'activity_id',
        [sequelize.literal('SUM(EXTRACT(EPOCH FROM hours)) / 3600'), 'completedHours'],
      ],
      where: { status: 'approved', activity_id: activityIds },
      group: ['activity_id'],
    });

    sums.forEach((s) => {
      completedMap[s.activity_id] = parseFloat(s.get('completedHours')) || 0;
    });
  }

  return activities.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    date: n.date,
    created_by: n.creator ? { id: n.creator.id, name: n.creator.name } : null,
    status: n.status,
    completed_hours: completedMap[n.id] ?? 0,
    project: n.project ? { id: n.project.id, name: n.project.name } : null,
  }));
};

// ? Update activity details by ID
exports.update = async (title, description, date, id, status, completed_hours = null, projectId = null) => {
  // Fetch activity to validate against project
  const activity = await Activity.findByPk(id);
  if (!activity) throw new NotFoundError('Activity not found');

  // If date provided, validate against project start_date
  if (date) {
    const project = await Project.findByPk(activity.project_id);
    if (!project) throw new NotFoundError('project not found');

    const activityDate = new Date(date);
    const projectStart = project.start_date ? new Date(project.start_date) : null;
    if (projectStart && activityDate < projectStart) {
      throw new BadRequestError('activity start date must be >= project start date');
    }
  }

  const payload = {};
  if (title !== undefined) payload.title = title;
  if (description !== undefined) payload.description = description;
  if (date !== undefined) payload.date = date;
  if (status !== undefined) payload.status = status;
  if (projectId !== undefined && projectId !== null) payload.project_id = projectId;
  // Note: completed_hours is not directly stored; it's calculated from work_logs

  // If no updatable fields provided, do nothing
  if (Object.keys(payload).length === 0) return;

  await Activity.update(payload, { where: { id } });
};

// ! Delete an activity by ID
exports.deleteActivity = async (id) => {
  await Activity.destroy({ where: { id } });
};

// ! Assign a single volunteer to an activity (replaces any existing)
exports.assignActivity = async (id, volunteer_id) => {
  const activity = await Activity.findByPk(id);
  if (!activity) throw new NotFoundError('Activity not found');
  await activity.setVolunteers([volunteer_id]);
};

// ! Remove a specific volunteer from an activity
exports.unassignActivity = async (id, volunteer_id) => {
  const activity = await Activity.findByPk(id);
  if (!activity) throw new NotFoundError('Activity not found');

  await activity.removeVolunteer(volunteer_id);
};

// * List all volunteers assigned to an activity
exports.getVolunteersByActivity = async (id) => {
  // Deprecated: use `getVolunteersByProject(projectId)` instead.
  const activity = await Activity.findByPk(id);
  if (!activity) return [];
  if (!activity.project_id) return [];
  return await exports.getVolunteersByProject(activity.project_id);
};

// Get a single activity formatted as the API expects
exports.getById = async (id) => {
  const activity = await Activity.findByPk(id, {
    attributes: ['id', 'title', 'description', 'date', 'created_at', 'created_by', 'project_id', 'status'],
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name'] },
      { model: Project, as: 'project', attributes: ['id', 'name'] },
    ],
  });

  if (!activity) throw new NotFoundError('Activity not found');

  // Calculate completed hours
  const sums = await WorkLog.findAll({
    attributes: [
      'activity_id',
      [sequelize.literal('SUM(EXTRACT(EPOCH FROM hours)) / 3600'), 'completedHours'],
    ],
    where: { status: 'approved', activity_id: id },
    group: ['activity_id'],
  });

  const completedHours = (sums[0] && parseFloat(sums[0].get('completedHours'))) || 0;

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    date: activity.date,
    created_by: activity.creator ? { id: activity.creator.id, name: activity.creator.name } : null,
    status: activity.status,
    completed_hours: completedHours,
    project: activity.project ? { id: activity.project.id, name: activity.project.name } : null,
  };
};

// Get volunteers by project id
exports.getVolunteersByProject = async (projectId) => {
  const project = await Project.findByPk(projectId, {
    include: {
      association: 'volunteers',
      attributes: ['id', 'name', 'email'],
      through: { attributes: [] },
    },
  });

  if (!project) throw new NotFoundError('Project not found');

  return (project.volunteers || []).map((v) => ({ id: v.id, name: v.name, email: v.email }));
};
