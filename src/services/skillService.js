const { Skill } = require('../models');

// * Create a new skill (coordinator only)
exports.create = async (name, sub) => {
    return await Skill.create({name, created_by: sub});
};

// * Fetch all skills
exports.getAll = async() => {
    return await Skill.findAll({
      attributes: ['id', 'name', 'created_by'],
      order: [['created_at', 'DESC']],
    });
};

// ? Update skill details by ID
exports.update = async (name, id) => {
  await Skill.update({ name }, { where: { id } });
};

// ! Delete a skill by ID
exports.deleteSkill = async (id) => {
  await Skill.destroy({ where: { id } });
};

// ! Assign a single volunteer to a skill (replaces any existing)
exports.assignSkill = async (id, volunteer_id) => {
  const skill = await Skill.findByPk(id);
  if (!skill) throw new Error("Skill not found");
  await skill.setVolunteers([volunteer_id]);
};

// ! Remove a specific volunteer from a skill
exports.unassignSkill = async (id, volunteer_id) => {
  const skill = await Skill.findByPk(id);
  if (!skill) throw new NotFoundError("Activity not found");

  await skill.removeVolunteer(volunteer_id);
};