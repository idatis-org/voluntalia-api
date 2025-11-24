'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_logs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      activity_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'activities', key: 'id' },
        onDelete: 'SET NULL',
      },
      week_start: { type: Sequelize.DATEONLY, allowNull: false },
      hours: { type: 'INTERVAL', allowNull: false }, // 4 dígitos, 2 decimales
      notes: { type: Sequelize.TEXT },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('work_logs');
  },
};