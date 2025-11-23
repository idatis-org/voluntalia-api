'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_volunteers', {
      activity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'activities', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      volunteer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('activity_volunteers');
  },
};
