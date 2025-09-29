'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      token: { type: Sequelize.TEXT, primaryKey: true },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      revoked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },
};