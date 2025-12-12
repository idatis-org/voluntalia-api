const worklogService = require('../services/worklogService');
const { WorkLog, Activity, Project } = require('../models');
const roles = require('../constants/roles');

// * Create a new worklog entry for the authenticated user
exports.create = async (req, res, next) => {
    try {
        const { activity, week_start, hours, notes } = req.body;

        // ! Validate required fields
        if (!week_start || !hours) return res.status(400).json({ error: 'week_start and hours are required' });

        const sub = req.user.sub;
        let activityId = undefined;
        if (activity) activityId = activity.id;

        const worklog = await worklogService.create(sub, activityId, week_start, hours, notes);
        res.status(201).json({ worklog });
    } catch (err) {
        next(err);
    }
};

// ? Update an existing worklog entry
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user_id, activity, week_start, hours, notes } = req.body;

        let activityId = undefined;
        if (activity) activityId = activity.id;

        await worklogService.update(id, user_id, activityId, week_start, hours, notes);
        res.status(201).json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// * Fetch all worklogs for the authenticated user
exports.me = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const worklog = await worklogService.getWorkById(user_id);
        res.status(201).json({ worklog });
    } catch (err) {
        next(err);
    }
};

// ! Coordinator-only: fetch worklogs for a specific user
exports.getWorkByUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const worklog = await worklogService.getWorkById(id);
        res.status(201).json({ worklog });
    } catch (err) {
        next(err);
    }
};

// ! Delete a worklog entry by ID
exports.deleteWorklog = async (req, res, next) => {
    try {
        const { id } = req.params;
        await worklogService.deleteWorklog(id);
        res.status(201).json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// Approve a worklog: only project manager of the associated project, or COORDINATOR
exports.approve = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const worklog = await WorkLog.findByPk(id, {
            include: [{ model: Activity, as: 'activity', include: [{ model: Project, as: 'project' }] }]
        });
        if (!worklog) return res.status(404).json({ error: 'WorkLog not found' });

        const activity = worklog.activity;
        const project = activity ? activity.project : null;

        const isCoordinator = user.role === roles.COORDINATOR;
        const isProjectManager = project && project.manager_id === user.sub;

        if (!isCoordinator && !isProjectManager) return res.status(403).json({ error: 'forbidden' });

        const updated = await worklogService.approveWorklog(id, user.sub);
        res.status(200).json({ worklog: updated });
    } catch (err) {
        next(err);
    }
};

// Unapprove a worklog: project manager or coordinator
exports.unapprove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const worklog = await WorkLog.findByPk(id, {
            include: [{ model: Activity, as: 'activity', include: [{ model: Project, as: 'project' }] }]
        });
        if (!worklog) return res.status(404).json({ error: 'WorkLog not found' });

        const activity = worklog.activity;
        const project = activity ? activity.project : null;

        const isCoordinator = user.role === roles.COORDINATOR;
        const isProjectManager = project && project.manager_id === user.sub;

        if (!isCoordinator && !isProjectManager) return res.status(403).json({ error: 'forbidden' });

        const updated = await worklogService.unapproveWorklog(id);
        res.status(200).json({ worklog: updated });
    } catch (err) {
        next(err);
    }
};