"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status enum column with default 'planned'
    await queryInterface.addColumn('projects', 'status', {
      type: Sequelize.ENUM('planned','active','completed','cancelled'),
      allowNull: false,
      defaultValue: 'planned',
    });

    // Make manager_id nullable
    await queryInterface.changeColumn('projects', 'manager_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert manager_id nullability
    await queryInterface.changeColumn('projects', 'manager_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Remove status column and drop enum type
    await queryInterface.removeColumn('projects', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_projects_status"');
  }
};
