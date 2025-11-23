'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
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
      filename: { type: Sequelize.TEXT, allowNull: false },
      mimetype: { type: Sequelize.TEXT, allowNull: false },
      storage_path: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.TEXT, allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('documents');
  },
};
