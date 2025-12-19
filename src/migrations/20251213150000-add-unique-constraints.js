'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Unique project names
    await queryInterface.addIndex('projects', ['name'], { name: 'ux_projects_name', unique: true });

    // Unique activity title per project
    await queryInterface.addIndex('activities', ['project_id', 'title'], { name: 'ux_activities_project_title', unique: true });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('activities', 'ux_activities_project_title');
    await queryInterface.removeIndex('projects', 'ux_projects_name');
  }
};
