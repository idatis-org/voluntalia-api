const projectService = require('../services/projectService');
const { NotFoundError } = require('../errors/errorTypes');

exports.create = async (req, res, next) => {
  try {
    const { name, description, manager_id, start_date, end_date } = req.body;
    if (!name || !manager_id) return res.status(400).json({ error: 'name and manager_id required' });

    // Only coordinators or project managers may create projects
    const requesterRole = req.user.role;
    const requesterId = req.user.sub;
    if (requesterRole === 'VOLUNTEER' || requesterRole === 'LEGAL') return res.status(403).json({ error: 'forbidden' });

    // Project managers can only create projects where they are the manager
    if (requesterRole === 'PROJECT_MANAGER' && manager_id !== requesterId) return res.status(403).json({ error: 'project managers can only create projects they manage' });

    const created_by = requesterId;
    const project = await projectService.create({ name, description, manager_id, start_date, end_date, created_by });
    res.status(201).json({ project });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const projects = await projectService.getAll();
    res.status(200).json({ projects });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await projectService.getById(id);
    res.status(200).json({ project });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Allow only coordinators or current project manager to update
    const project = await projectService.getById(id);
    const userSub = req.user.sub;
    const isManager = project.manager_id === userSub;
    const isCoordinator = req.user.role === 'COORDINATOR';
    if (!isManager && !isCoordinator) return res.status(403).json({ error: 'forbidden' });

    const updated = await projectService.update(id, data, { id: userSub, role: req.user.role });
    res.status(200).json({ project: updated });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    // Only coordinators may delete projects
    if (req.user.role !== 'COORDINATOR') return res.status(403).json({ error: 'forbidden' });

    const { id } = req.params;
    await projectService.delete(id);
    res.status(200).json({ ok: true });
  } catch (err) { next(err); }
};

exports.addVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params; // project id
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const project = await projectService.getById(id);
    const userSub = req.user.sub;
    const isManager = project.manager_id === userSub;
    const isCoordinator = req.user.role === 'COORDINATOR';
    if (!isManager && !isCoordinator) return res.status(403).json({ error: 'forbidden' });

    await projectService.addVolunteer(id, user_id, userSub, { id: userSub, role: req.user.role });
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
};

exports.removeVolunteer = async (req, res, next) => {
  try {
    const { id, user_id } = req.params; // project id and volunteer id

    const project = await projectService.getById(id);
    const userSub = req.user.sub;
    const isManager = project.manager_id === userSub;
    const isCoordinator = req.user.role === 'COORDINATOR';
    if (!isManager && !isCoordinator) return res.status(403).json({ error: 'forbidden' });

    await projectService.removeVolunteer(id, user_id, { id: userSub, role: req.user.role });
    res.status(200).json({ ok: true });
  } catch (err) { next(err); }
};

exports.assignActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const { project_id } = req.body; // may be null to unassign

    // Allow coordinators or activity creators to assign
    const actor = { id: req.user.sub, role: req.user.role };
    const activity = await projectService.assignActivity(id, project_id, actor);
    res.status(200).json({ activity });
  } catch (err) { next(err); }
};
