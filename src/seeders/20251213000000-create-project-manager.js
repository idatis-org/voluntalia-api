"use strict";
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hash = await bcrypt.hash('123456', 10);

    // Create a test Project Manager for local development
    await queryInterface.bulkInsert('users', [
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Test Project Manager',
        email: 'pm@voluntalia.test',
        password_hash: hash,
        role: 'PROJECT_MANAGER',
        is_active: true,
        phone: null,
        location: null,
        country: '',
        city: '',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'pm@voluntalia.test' }, {});
  },
};
