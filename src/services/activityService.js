const { VOLUNTEER } = require('../constants/roles');
const { NotFoundError } = require('../errors/errorTypes');
const { Activity, User } = require('../models');
const sequelize = require('sequelize');

// * Create a new activity (coordinator only)
exports.create = async (title, description, date, sub) => {
  return await Activity.create({ title, description, date, created_by: sub });
};

// * Fetch all activities with creator name
exports.getAll = async () => {
  const activities = await Activity.findAll({
    attributes: ['id', 'title', 'description', 'date', 'created_at'],
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['name'],
      },
      {
        model: User,
        as: 'volunteers',
        attributes: ['id', 'name', 'email'],
        through: { attributes: [] }, // exclude junction fields
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return activities.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    date: n.date,
    created_name: n.creator?.name ?? null,
    total_volunteers: (n.volunteers || []).length,
    volunteers: (n.volunteers || []).map((v) => ({
      id: v.id,
      name: v.name,
      email: v.email,
    })),
  }));
};

// ? Update activity details by ID
exports.update = async (title, description, date, id) => {
  await Activity.update({ title, description, date }, { where: { id } });
};

// ! Delete an activity by ID
exports.deleteActivity = async (id) => {
  await Activity.destroy({ where: { id } });
};

// ! Assign a single volunteer to an activity (replaces any existing)
exports.assignActivity = async (id, volunteer_id) => {
  const activity = await Activity.findByPk(id);
  if (!activity) throw new NotFoundError('Activity not found');
  await activity.setVolunteers([volunteer_id]);
};

// ! Remove a specific volunteer from an activity
exports.unassignActivity = async (id, volunteer_id) => {
  const activity = await Activity.findByPk(id);
  if (!activity) throw new NotFoundError('Activity not found');

  await activity.removeVolunteer(volunteer_id);
};

// * List all volunteers assigned to an activity
exports.getVolunteersByActivity = async (id) => {
  const activity = await Activity.findByPk(id, {
    include: {
      association: 'volunteers',
      attributes: ['id', 'name', 'email'],
    },
  });

  // ? Return empty array if no volunteers
  return activity?.volunteers ?? [];
};
