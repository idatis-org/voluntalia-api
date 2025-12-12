'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('work_logs', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });

    await queryInterface.addColumn('work_logs', 'approved_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addColumn('work_logs', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addIndex('work_logs', ['status'], { name: 'idx_work_logs_status' });
    await queryInterface.addIndex('work_logs', ['approved_by'], { name: 'idx_work_logs_approved_by' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('work_logs', 'idx_work_logs_approved_by');
    await queryInterface.removeIndex('work_logs', 'idx_work_logs_status');

    await queryInterface.removeColumn('work_logs', 'approved_at');
    await queryInterface.removeColumn('work_logs', 'approved_by');
    await queryInterface.removeColumn('work_logs', 'status');
  }
};
