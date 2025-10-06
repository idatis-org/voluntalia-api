const { User, Activity, WorkLog } = require('../models');

// * Retrieve up to 100 newest users with their activity relations
exports.getAllUsers = async () => {
  return await User.findAll({
    // ? Only expose safe, necessary fields
    attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
    // ! Order by newest first to keep recent sign-ups on top
    order: [['created_at', 'DESC']],
    limit: 100,

    include: [
      {
        model: Activity,
        as: 'createdActivities',
        attributes: ['id', 'title', 'description', 'date'],
      },
      {
        model: Activity,
        as: 'volunteerActivities',
        attributes: ['id', 'title', 'description', 'date'],
        through: { attributes: [] }, // * Exclude junction table fields
      },
      {
        model: WorkLog,
        as: 'workLogs',
        attributes: ['hours'],
      },
    ],
  });
};
