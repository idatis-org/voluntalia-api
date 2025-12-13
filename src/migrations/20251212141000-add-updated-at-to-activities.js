'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('activities', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('activities', 'updated_at');
  }
};
