const worklogService = require('../services/worklogService');

// * Create a new worklog entry for the authenticated user
exports.create = async (req, res, next) => {
  try {
    const { activity, week_start, hours, notes } = req.body;

    // ! Validate required fields
    if (!week_start || !hours)
      return res
        .status(400)
        .json({ error: 'week_start and hours are required' });

    const sub = req.user.sub;
    let activityId = undefined;
    if (activity) activityId = activity.id;

    const worklog = await worklogService.create(
      sub,
      activityId,
      week_start,
      hours,
      notes
    );
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

    await worklogService.update(
      id,
      user_id,
      activityId,
      week_start,
      hours,
      notes
    );
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
