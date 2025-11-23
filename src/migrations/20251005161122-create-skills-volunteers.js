'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('skills_volunteers', {
      volunteer_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        primaryKey: true,
        allowNull: false,
      },
      skill_id: {
        type: DataTypes.UUID,
        references: {
          model: 'skills',
          key: 'id',
        },
        onDelete: 'CASCADE',
        primaryKey: true,
        allowNull: false,
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.literal('NOW()'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('skills_volunteers');
  },
};
