'use strict';
const { WorkLog } = require('../models');

module.exports = {
  async up() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // lunes actual

    const demoLogs = [
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        week_start: monday,
        hours: '02:30:00',
        notes: 'Lunes mañana',
      },
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        week_start: monday,
        hours: '03:15:00',
        notes: 'Lunes tarde',
      },
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        week_start: monday,
        hours: '01:45:00',
        notes: 'Martes',
      },
      {
        user_id: '22222222-2222-2222-2222-222222222222',
        week_start: monday,
        hours: '05:00:00',
        notes: 'Jornada completa',
      },
    ];

    await WorkLog.bulkCreate(demoLogs, { returning: false });
  },

  async down() {
    await WorkLog.destroy({ truncate: true, cascade: true });
  },
};
