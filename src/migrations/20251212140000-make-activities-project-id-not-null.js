'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure there are no NULLs left (should be handled by backfill migration)
    // Then alter column to SET NOT NULL and update FK to RESTRICT on delete
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        "SELECT COUNT(*) FROM activities WHERE project_id IS NULL",
        { transaction }
      );

      await queryInterface.changeColumn('activities', 'project_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'projects', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      }, { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('activities', 'project_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'projects', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      }, { transaction });
    });
  }
};
