const models = require('../models/');
const { WorkLog, Activity, Project } = models;

// * Create a new worklog entry linked to a user (and optional activity)
exports.create = async (user_id, activity_id, week_start, hours, notes) => {
    return await WorkLog.create({ user_id, activity_id, week_start, hours, notes });
};

// ? Update an existing worklog by ID
exports.update = async (id, user_id, activity_id, week_start, hours, notes) => {
    await WorkLog.update(
        { user_id, activity_id, week_start, hours, notes },
        { where: { id } }
    );
};

// * Fetch all worklogs for a given user, newest first
exports.getWorkById = async (user_id) => {
    const activities = await WorkLog.findAll({
        where: { user_id },
        attributes: ['id', 'week_start', 'hours', 'notes'],
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
        activity: n.activity ?? null,
    }));
};

// ! Permanently delete a worklog entry by ID
exports.deleteWorklog = async (id) => {
    await WorkLog.destroy({ where: { id } });
};

// Approve a worklog: set status -> 'approved', fill approved_by and approved_at
exports.approveWorklog = async (id, approverId) => {
    const worklog = await WorkLog.findByPk(id, {
        include: [{ model: Activity, as: 'activity', include: [{ model: Project, as: 'project' }] }]
    });
    if (!worklog) throw new Error('WorkLog not found');

    // set approved fields
    await worklog.update({ status: 'approved', approved_by: approverId, approved_at: new Date() });
    return worklog;
};

// Unapprove a worklog: reset status -> 'pending' and clear approver fields
exports.unapproveWorklog = async (id) => {
    const worklog = await WorkLog.findByPk(id);
    if (!worklog) throw new Error('WorkLog not found');

    await worklog.update({ status: 'pending', approved_by: null, approved_at: null });
    return worklog;
};