'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_preferences', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      email_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      push_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sms_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      event_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      update_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      language: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'en',
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'America/New_York',
      },
      date_format: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'MM/DD/YYYY',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_preferences');
  },
};
