const worklogService = require('../services/worklogService');
const { NotFoundError } = require('../errors/errorTypes');

// * Create a new worklog entry for the authenticated user
exports.create = async (req, res, next) => {
    try {
        const { activity, week_start, hours, notes } = req.body;

        const sub = req.user.sub;
        let activityId = undefined;
        if (activity) activityId = activity.id;

        const worklog = await worklogService.create(sub, activityId, week_start, hours, notes);
        res.status(201).json({ worklog });
    } catch (err) {
        next(err);
    }
};

// ? Update an existing worklog entry (own entry only, unless COORDINATOR)
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { activity, week_start, hours, notes } = req.body;

        let activityId = undefined;
        if (activity) activityId = activity.id;

        await worklogService.update(id, req.user, activityId, week_start, hours, notes);
        res.status(200).json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// * Fetch all worklogs for the authenticated user
exports.me = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const worklog = await worklogService.getWorkById(user_id);
        res.status(200).json({ worklog });
    } catch (err) {
        next(err);
    }
};

// ! Coordinator-only: fetch worklogs for a specific user
exports.getWorkByUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const worklog = await worklogService.getWorkById(id);
        res.status(200).json({ worklog });
    } catch (err) {
        next(err);
    }
};

// ! Delete a worklog entry by ID (own entry only, unless COORDINATOR)
exports.deleteWorklog = async (req, res, next) => {
    try {
        const { id } = req.params;
        await worklogService.deleteWorklog(id, req.user);
        res.status(200).json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ! Coordinator-only: approve or reject a worklog entry
exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await worklogService.updateStatus(id, status);
        if (!updated) throw new NotFoundError('Worklog entry not found');

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};