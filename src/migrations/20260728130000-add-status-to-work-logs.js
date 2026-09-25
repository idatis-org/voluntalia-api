'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('work_logs', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('work_logs', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_work_logs_status";');
  },
};
