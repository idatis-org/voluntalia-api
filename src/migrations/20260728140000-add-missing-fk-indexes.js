'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('work_logs', ['user_id']);
    await queryInterface.addIndex('work_logs', ['activity_id']);

    await queryInterface.addIndex('documents', ['user_id']);
    await queryInterface.addIndex('documents', ['category_id']);
    await queryInterface.addIndex('documents', ['resource_type_id']);

    // activity_volunteers ya tiene PK compuesta (activity_id, volunteer_id),
    // que cubre bien las búsquedas por activity_id; falta volunteer_id solo.
    await queryInterface.addIndex('activity_volunteers', ['volunteer_id']);

    // skills_volunteers ya tiene PK compuesta (volunteer_id, skill_id),
    // que cubre bien las búsquedas por volunteer_id; falta skill_id solo.
    await queryInterface.addIndex('skills_volunteers', ['skill_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('work_logs', ['user_id']);
    await queryInterface.removeIndex('work_logs', ['activity_id']);
    await queryInterface.removeIndex('documents', ['user_id']);
    await queryInterface.removeIndex('documents', ['category_id']);
    await queryInterface.removeIndex('documents', ['resource_type_id']);
    await queryInterface.removeIndex('activity_volunteers', ['volunteer_id']);
    await queryInterface.removeIndex('skills_volunteers', ['skill_id']);
  },
};
