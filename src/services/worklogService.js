const { WorkLog, Activity } = require('../models/');

// * Create a new worklog entry linked to a user (and optional activity)
exports.create = async (user_id, activity_id, week_start, hours, notes) => {
  return await WorkLog.create({
    user_id,
    activity_id,
    week_start,
    hours,
    notes,
  });
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
  return activities.map((n) => ({
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
