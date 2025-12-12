'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project_volunteers', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'projects', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      assigned_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      }
    });

    await queryInterface.addConstraint('project_volunteers', {
      fields: ['project_id', 'user_id'],
      type: 'unique',
      name: 'uniq_project_user'
    });

    await queryInterface.addIndex('project_volunteers', ['project_id'], { name: 'idx_project_volunteers_project_id' });
    await queryInterface.addIndex('project_volunteers', ['user_id'], { name: 'idx_project_volunteers_user_id' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('project_volunteers', 'idx_project_volunteers_user_id');
    await queryInterface.removeIndex('project_volunteers', 'idx_project_volunteers_project_id');
    await queryInterface.removeConstraint('project_volunteers', 'uniq_project_user');
    await queryInterface.dropTable('project_volunteers');
  }
};
