'use strict';
const { Skill } = require('../models');

module.exports = {
  async up () {
    const anaId   = '11111111-1111-1111-1111-111111111111';
    const carlosId = '22222222-2222-2222-2222-222222222222';
    const demoLogs = [
      { name: "Frontend", created_by: anaId },
      { name: "Backend", created_by: anaId },
      { name: "Microservicios", created_by: carlosId },
      { name: "Ngrx", created_by: carlosId },
    ];

    await Skill.bulkCreate(demoLogs, { returning: false });
  },

  async down () {
    await Skill.destroy({ truncate: true, cascade: true });
  }
};