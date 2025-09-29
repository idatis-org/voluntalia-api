'use strict';
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = {
  async up() {
    const hash = await bcrypt.hash('123456', 10);

    const users = [
      // COORDINADORES
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Ana García',
        email: 'ana@voluntalia.com',
        password_hash: hash,
        role: 'COORDINATOR',
        phone: '+34600000001',
        location: 'Madrid',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Carlos López',
        email: 'carlos@voluntalia.com',
        password_hash: hash,
        role: 'COORDINATOR',
        phone: '+34600000002',
        location: 'Barcelona',
      },

      // VOLUNTARIOS
      {
        name: 'Lucía Fernández',
        email: 'lucia@mail.com',
        password_hash: hash,
        role: 'VOLUNTEER',
        phone: '+34600000003',
        location: 'Sevilla',
      },
      {
        name: 'Miguel Ruiz',
        email: 'miguel@mail.com',
        password_hash: hash,
        role: 'VOLUNTEER',
        phone: '+34600000004',
        location: 'Valencia',
      },
      {
        name: 'Sara Díaz',
        email: 'sara@mail.com',
        password_hash: hash,
        role: 'VOLUNTEER',
        phone: '+34600000005',
        location: 'Málaga',
      },

      // LEGAL
      {
        name: 'Elena Martínez',
        email: 'elena@legal.com',
        password_hash: hash,
        role: 'LEGAL',
        phone: '+34600000006',
        location: 'Bilbao',
      },
    ];

    await User.bulkCreate(users, { returning: false });
  },

  async down() {
    await User.destroy({ truncate: true, cascade: true });
  }
};