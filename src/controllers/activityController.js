const activityService = require('../services/activityService');

// ! Coordinator-only: create a new activity
exports.create = async (req, res, next) => {
  try {
    const { title, description, date } = req.body;
    const sub = req.user.sub;

    // ! Validate required fields
    if (!title || !date)
      return res.status(400).json({ error: 'title and date are required' });

    const activity = await activityService.create(
      title,
      description,
      date,
      sub
    );
    res.status(201).json({ activity });
  } catch (err) {
    next(err);
  }
};

// * Fetch all activities (any authenticated user)
exports.getAllActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getAll();
    res.status(201).json({ activities });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: update an existing activity
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;

    await activityService.update(title, description, date, id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: delete an activity
exports.deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    await activityService.deleteActivity(id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: assign a volunteer to an activity
exports.assignActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const { volunteer_id } = req.body;

    // ! Validate required field
    if (!volunteer_id)
      return res.status(400).json({ error: 'volunteer_id required' });

    await activityService.assignActivity(id, volunteer_id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: remove a volunteer from an activity
exports.unassignActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const { volunteer_id } = req.body;

    // ! Validate required field
    if (!volunteer_id)
      return res.status(400).json({ error: 'volunteer_id required' });

    await activityService.unassignActivity(id, volunteer_id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// * List all volunteers assigned to a specific activity
exports.getVolunteersByActivity = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const users = await activityService.getVolunteersByActivity(id);
    res.status(201).json({ users });
  } catch (err) {
    next(err);
  }
};
