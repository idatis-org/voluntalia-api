const { WorkLog, Activity } = require('../models/');
const { NotFoundError, ForbiddenError } = require('../errors/errorTypes');
const { COORDINATOR } = require('../constants/roles');

// * Create a new worklog entry linked to a user (and optional activity)
exports.create = async (user_id, activity_id, week_start, hours, notes) => {
    return await WorkLog.create({ user_id, activity_id, week_start, hours, notes });
};

// ? Update an existing worklog by ID (own entry only, unless COORDINATOR)
exports.update = async (id, requestingUser, activity_id, week_start, hours, notes) => {
    const entry = await WorkLog.findByPk(id);
    if (!entry) throw new NotFoundError('Worklog entry not found');

    if (entry.user_id !== requestingUser.sub && requestingUser.role !== COORDINATOR) {
        throw new ForbiddenError('You can only modify your own worklog entries');
    }

    await entry.update({ activity_id, week_start, hours, notes });
};

// * Fetch all worklogs for a given user, newest first
exports.getWorkById = async (user_id) => {
    const activities = await WorkLog.findAll({
        where: { user_id },
        attributes: ['id', 'week_start', 'hours', 'notes', 'status'],
        include: {
            model: Activity,
            as: 'activity',
            attributes: ['id', 'title', 'description', 'date'],
        },
        order: [['created_at', 'DESC']],
    });

    // ? Map to clean payload (activity can be null)
    return activities.map(n => ({
        id: n.id,
        week_start: n.week_start,
        hours: n.hours,
        notes: n.notes,
        status: n.status,
        activity: n.activity ?? null,
    }));
};

// ! Permanently delete a worklog entry by ID (own entry only, unless COORDINATOR)
exports.deleteWorklog = async (id, requestingUser) => {
    const entry = await WorkLog.findByPk(id);
    if (!entry) throw new NotFoundError('Worklog entry not found');

    if (entry.user_id !== requestingUser.sub && requestingUser.role !== COORDINATOR) {
        throw new ForbiddenError('You can only delete your own worklog entries');
    }

    await entry.destroy();
};

// * COORDINATOR only: approve or reject a worklog entry
exports.updateStatus = async (id, status) => {
    const [affectedRows] = await WorkLog.update({ status }, { where: { id } });
    return affectedRows > 0;
};
