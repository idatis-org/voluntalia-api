'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'country', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });
    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'country');
    await queryInterface.removeColumn('users', 'city');
  },
};
