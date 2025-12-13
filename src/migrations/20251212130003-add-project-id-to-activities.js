'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('activities', 'project_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'projects', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addIndex('activities', ['project_id'], { name: 'idx_activities_project_id' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('activities', 'idx_activities_project_id');
    await queryInterface.removeColumn('activities', 'project_id');
  }
};
