'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('activities', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'planned'
    });

    await queryInterface.addIndex('activities', ['status'], { name: 'idx_activities_status' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('activities', 'idx_activities_status');
    await queryInterface.removeColumn('activities', 'status');
  }
};
