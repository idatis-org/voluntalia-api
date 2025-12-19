const activityService = require('../services/activityService');
const { Project, Activity, User, WorkLog } = require('../models');
const db = require('../models');
const SequelizeLib = require('sequelize');
const roles = require('../constants/roles');
const { BadRequestError, NotFoundError, ForbiddenError, ConflictError } = require('../errors/errorTypes');

/**
 * POST /activity/create
 * Create a new activity
 * 
 * Allowed roles:
 * - COORDINATOR: can create activities in any project
 * - PROJECT_MANAGER: can create activities only in their assigned project
 * - VOLUNTEER: forbidden (403)
 */
exports.create = async (req, res, next) => {
  try {
    const { title, description, date, project_id } = req.body;
    const sub = req.user.sub;
    const userRole = req.user.role;

    // Validate input and collect errors
    const errors = [];
    if (!title || String(title).trim() === '') errors.push('title is required');
    if (!date || String(date).trim() === '') {
      errors.push('date is required');
    } else if (isNaN(Date.parse(date))) {
      errors.push('date must be a valid date (YYYY-MM-DD)');
    }
    if (!project_id) errors.push('project_id is required');
    if (errors.length) throw new BadRequestError(errors);

    // Check if user has permission to create activities
    if (userRole === roles.VOLUNTEER || userRole === 'LEGAL') {
      throw new ForbiddenError('Only coordinators and project managers can create activities');
    }

    if (userRole === roles.PROJECT_MANAGER) {
      // PROJECT_MANAGER: validate that the activity's project matches their assigned project
      const project = await Project.findByPk(project_id);
      if (!project) throw new NotFoundError('project not found');
      if (project.manager_id !== sub) throw new ForbiddenError('You can only create activities in your assigned project');
    }

    // Check for duplicate title within project
    const exists = await Activity.findOne({ where: { title, project_id } });
    if (exists) throw new ConflictError('activity with same title already exists in project');

    const activity = await activityService.create(title, description, date, sub, project_id);
    return res.status(201).json({ activity });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /activity
 * Fetch activities filtered by user role
 * 
 * - COORDINATOR: sees all activities
 * - PROJECT_MANAGER: sees only activities from their assigned project
 * - VOLUNTEER: sees only activities from projects they are members of
 */
exports.getAllActivities = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const userRole = req.user.role;
    
    // Get user's project assignments (for VOLUNTEER filtering)
    let userProjects = [];
    if (userRole === roles.VOLUNTEER) {
      const user = await User.findByPk(userId, {
        include: {
          association: 'projects',
          attributes: ['id'],
          through: { attributes: [] },
        },
      });
      if (user && user.projects) {
        userProjects = user.projects.map(p => p.id);
      }
    }

    // Call updated service with filtering parameters
    const activities = await activityService.getAll(
      userId,
      userRole,
      req.user.project_id || null, // PROJECT_MANAGER's project_id
      userProjects // VOLUNTEER's projects list
    );

    res.status(200).json({ activities });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /activity/:id
 * Get a single activity by id (formatted)
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await activityService.getById(id);
    res.status(200).json({ activity });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /activity/:id
 * Update an existing activity
 * 
 * Allowed roles:
 * - COORDINATOR: can update any activity (all fields)
 * - PROJECT_MANAGER: can update only activities in their assigned project
 * - VOLUNTEER: forbidden (403)
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, status, completed_hours, project_id } = req.body;
    const userRole = req.user.role;
    const userId = req.user.sub;

    // Authorization: only COORDINATOR and PROJECT_MANAGER can update
    if (userRole === roles.VOLUNTEER || userRole === 'LEGAL') {
      throw new ForbiddenError('Only coordinators and project managers can update activities');
    }

    // Get the activity to check permissions
    const activity = await Activity.findByPk(id);
    if (!activity) throw new NotFoundError('Activity not found');

    // Check PROJECT_MANAGER permissions
    if (userRole === roles.PROJECT_MANAGER) {
      const project = await Project.findByPk(activity.project_id);
      if (!project || project.manager_id !== userId) {
        throw new ForbiddenError('You can only update activities in your assigned project');
      }
    }

    // Prevent changing completed_hours from activity endpoint; must be done via work_logs
    if (completed_hours !== undefined) {
      throw new ForbiddenError('completed_hours cannot be modified via activity; update work_logs instead');
    }

    // If client provided project_id in the body, only coordinators can change it
    if (project_id !== undefined) {
      if (project_id === null) throw new BadRequestError('project_id cannot be null');
      if (userRole !== roles.COORDINATOR) {
        throw new ForbiddenError('Only coordinators can change project_id');
      }
      // Validate target project exists
      const newProject = await Project.findByPk(project_id);
      if (!newProject) throw new NotFoundError('project not found');
    }

    // Validate input for update (partial allowed)
    const updateErrors = [];
    if (title !== undefined && String(title).trim() === '') updateErrors.push('title cannot be empty');
    if (date !== undefined) {
      if (String(date).trim() === '') updateErrors.push('date cannot be empty');
      else if (isNaN(Date.parse(date))) updateErrors.push('date must be a valid date (YYYY-MM-DD)');
    }
    const allowedStatuses = ['planned', 'active', 'completed', 'cancelled'];
    if (status !== undefined && !allowedStatuses.includes(status)) updateErrors.push(`status must be one of: ${allowedStatuses.join(', ')}`);
    if (project_id !== undefined && project_id === null) updateErrors.push('project_id cannot be null');
    if (updateErrors.length) throw new BadRequestError(updateErrors);

    // Perform the update
    await activityService.update(title, description, date, id, status, completed_hours, project_id);

    const responseActivity = await activityService.getById(id);
    res.status(200).json({ activity: responseActivity });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /activity/:id
 * Delete an activity
 * 
 * Allowed roles:
 * - COORDINATOR: can delete any activity
 * - PROJECT_MANAGER: can delete only activities in their assigned project
 * - VOLUNTEER: forbidden (403)
 */
exports.deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.sub;

    // Authorization: only COORDINATOR and PROJECT_MANAGER can delete
    if (userRole === roles.VOLUNTEER || userRole === 'LEGAL') {
      throw new ForbiddenError('Only coordinators and project managers can delete activities');
    }

    // Get the activity to check permissions
    const activity = await Activity.findByPk(id);
    if (!activity) throw new NotFoundError('Activity not found');

    // Check PROJECT_MANAGER permissions
    if (userRole === roles.PROJECT_MANAGER) {
      const project = await Project.findByPk(activity.project_id);
      if (!project || project.manager_id !== userId) {
        throw new ForbiddenError('You can only delete activities in your assigned project');
      }
    }

    await activityService.deleteActivity(id);
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /activity/:id/assign
 * Assign a volunteer to an activity
 * 
 * Allowed roles:
 * - COORDINATOR: can assign volunteers to any activity
 * - PROJECT_MANAGER: can assign volunteers to activities in their assigned project
 */
exports.assignActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const { volunteer_id } = req.body;
    if (!volunteer_id) throw new BadRequestError('volunteer_id required');

    const activity = await Activity.findByPk(id);
    if (!activity) throw new NotFoundError('Activity not found');

    const userRole = req.user.role;
    const userId = req.user.sub;

    // Authorization: only COORDINATOR and PROJECT_MANAGER can assign
    if (userRole === roles.VOLUNTEER || userRole === 'LEGAL') {
      throw new ForbiddenError('Only coordinators and project managers can assign volunteers');
    }

    // Check PROJECT_MANAGER permissions
    if (userRole === roles.PROJECT_MANAGER) {
      if (!activity.project_id) throw new ForbiddenError('activity not linked to a project');
      const project = await Project.findByPk(activity.project_id);
      if (!project || project.manager_id !== userId) {
        throw new ForbiddenError('You can only assign volunteers to activities in your assigned project');
      }
    }

    await activityService.assignActivity(id, volunteer_id);
    return res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /activity/:id/unassign
 * Remove a volunteer from an activity
 * 
 * Allowed roles:
 * - COORDINATOR: can unassign volunteers from any activity
 * - PROJECT_MANAGER: can unassign volunteers from activities in their assigned project
 */
exports.unassignActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const { volunteer_id } = req.body;
    if (!volunteer_id) throw new BadRequestError('volunteer_id required');

    const activity = await Activity.findByPk(id);
    if (!activity) throw new NotFoundError('Activity not found');

    const userRole = req.user.role;
    const userId = req.user.sub;

    // Authorization: only COORDINATOR and PROJECT_MANAGER can unassign
    if (userRole === roles.VOLUNTEER || userRole === 'LEGAL') {
      throw new ForbiddenError('Only coordinators and project managers can unassign volunteers');
    }

    // Check PROJECT_MANAGER permissions
    if (userRole === roles.PROJECT_MANAGER) {
      if (!activity.project_id) throw new ForbiddenError('activity not linked to a project');
      const project = await Project.findByPk(activity.project_id);
      if (!project || project.manager_id !== userId) {
        throw new ForbiddenError('You can only unassign volunteers from activities in your assigned project');
      }
    }

    await activityService.unassignActivity(id, volunteer_id);
    return res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /activity/:id/volunteers
 * List all volunteers assigned to a specific activity
 */
exports.getVolunteersByActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const activity = await Activity.findByPk(id);
    if (!activity) throw new NotFoundError('Activity not found');

    if (!activity.project_id) return res.status(200).json({ users: [] });

    const users = await activityService.getVolunteersByProject(activity.project_id);
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

// GET /activity/stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const userRole = req.user.role;

    const { projectId, status, dateFrom, dateTo, search, userId: qUserId, userScoped } = req.query;
    const scoped = userScoped === 'true' || userScoped === true;
    const scopedUserId = qUserId || (scoped ? userId : null);

    let baseWhereParts = [];
    const replacements = {};

    if (userRole === roles.COORDINATOR) {
      // no extra base filter
    } else if (userRole === roles.PROJECT_MANAGER) {
      const mgrProjectId = req.user.project_id || null;
      if (!mgrProjectId) return res.status(200).json({ total: 0, statusCounts: { planned:0, active:0, completed:0, cancelled:0 }, upcoming7Days: 0, totalLoggedHours: 0, averageHoursPerActivity: 0, uniqueVolunteers: 0, filtered: 0 });
      if (projectId && projectId !== mgrProjectId) throw new ForbiddenError('Not allowed for this project');
      baseWhereParts.push('a.project_id = :mgrProjectId');
      replacements.mgrProjectId = mgrProjectId;
    } else if (userRole === roles.VOLUNTEER) {
      const user = await User.findByPk(userId, {
        include: { association: 'projects', attributes: ['id'], through: { attributes: [] } },
      });
      const userProjects = (user && user.projects) ? user.projects.map(p => p.id) : [];
      if (projectId && !userProjects.includes(projectId)) throw new ForbiddenError('Not allowed for this project');
      if (userProjects.length === 0) {
        return res.status(200).json({ total: 0, statusCounts: { planned:0, active:0, completed:0, cancelled:0 }, upcoming7Days: 0, totalLoggedHours: 0, averageHoursPerActivity: 0, uniqueVolunteers: 0, filtered: 0 });
      }
      baseWhereParts.push('a.project_id IN (:userProjects)');
      replacements.userProjects = userProjects;
    } else {
      throw new ForbiddenError('Role not authorized');
    }

    let whereParts = [...baseWhereParts];

    if (projectId) { whereParts.push('a.project_id = :projectId'); replacements.projectId = projectId; }
    if (status) { whereParts.push('a.status = :status'); replacements.status = status; }
    if (dateFrom) { whereParts.push('a.date >= :dateFrom'); replacements.dateFrom = dateFrom; }
    if (dateTo) { whereParts.push('a.date <= :dateTo'); replacements.dateTo = dateTo; }
    if (search) { whereParts.push('(a.title ILIKE :search OR a.description ILIKE :search)'); replacements.search = `%${search}%`; }
    if (scoped && scopedUserId) {
      whereParts.push('EXISTS (SELECT 1 FROM activity_volunteers av WHERE av.activity_id = a.id AND av.volunteer_id = :scopedUserId)');
      replacements.scopedUserId = scopedUserId;
      if (userRole === roles.VOLUNTEER && scopedUserId !== userId) throw new ForbiddenError('Volunteers cannot query other users');
    }

    const baseWhereSql = baseWhereParts.length ? ('WHERE ' + baseWhereParts.join(' AND ')) : '';
    const filteredWhereSql = whereParts.length ? ('WHERE ' + whereParts.join(' AND ')) : '';

    const dbs = db.sequelize;

    const totalSql = `SELECT COUNT(*)::int AS count FROM activities a ${baseWhereSql}`;
    const totalRes = await dbs.query(totalSql, { type: dbs.QueryTypes.SELECT, replacements });
    const total = (totalRes[0] && parseInt(totalRes[0].count,10)) || 0;

    const filteredSql = `SELECT COUNT(*)::int AS count FROM activities a ${filteredWhereSql}`;
    const filteredRes = await dbs.query(filteredSql, { type: dbs.QueryTypes.SELECT, replacements });
    const filtered = (filteredRes[0] && parseInt(filteredRes[0].count,10)) || 0;

    const statusesSql = `SELECT a.status, COUNT(*)::int AS count FROM activities a ${filteredWhereSql} GROUP BY a.status`;
    const statuses = await dbs.query(statusesSql, { type: dbs.QueryTypes.SELECT, replacements });
    const statusCounts = { planned: 0, active: 0, completed: 0, cancelled: 0 };
    statuses.forEach(s => { statusCounts[s.status] = parseInt(s.count,10) || 0; });

    const upcomingSql = `SELECT COUNT(*)::int AS count FROM activities a ${filteredWhereSql} ${filteredWhereSql ? 'AND' : 'WHERE'} a.date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '6 days')`;
    const upcomingRes = await dbs.query(upcomingSql, { type: dbs.QueryTypes.SELECT, replacements });
    const upcoming7Days = (upcomingRes[0] && parseInt(upcomingRes[0].count,10)) || 0;

    const wlUserClause = (scoped && scopedUserId) ? 'AND wl.user_id = :scopedUserId' : '';
    const hoursSql = `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM wl.hours))/3600,0) AS hours FROM activities a JOIN work_logs wl ON wl.activity_id = a.id AND wl.status = 'approved' ${wlUserClause} ${filteredWhereSql ? 'WHERE ' + whereParts.join(' AND ').replace(/EXISTS \(SELECT 1 FROM activity_volunteers av WHERE av.activity_id = a.id AND av.volunteer_id = :scopedUserId\)/, '(EXISTS (SELECT 1 FROM activity_volunteers av WHERE av.activity_id = a.id AND av.volunteer_id = :scopedUserId))') : ''}`;
    const hoursRes = await dbs.query(hoursSql, { type: dbs.QueryTypes.SELECT, replacements });
    const totalLoggedHours = hoursRes[0] ? parseFloat(hoursRes[0].hours) || 0 : 0;

    const uniqSql = `SELECT COUNT(DISTINCT av.volunteer_id)::int AS count FROM activities a JOIN activity_volunteers av ON av.activity_id = a.id ${filteredWhereSql}`;
    const uniqRes = await dbs.query(uniqSql, { type: dbs.QueryTypes.SELECT, replacements });
    const uniqueVolunteers = (uniqRes[0] && parseInt(uniqRes[0].count,10)) || 0;

    const averageHoursPerActivity = filtered > 0 ? (totalLoggedHours / filtered) : 0;

    return res.status(200).json({
      total,
      statusCounts,
      upcoming7Days,
      totalLoggedHours: Number(totalLoggedHours),
      averageHoursPerActivity: Number(Number(averageHoursPerActivity).toFixed(2)),
      uniqueVolunteers,
      filtered,
    });
  } catch (err) {
    next(err);
  }
};
