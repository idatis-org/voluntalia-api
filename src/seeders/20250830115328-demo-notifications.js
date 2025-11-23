'use strict';
const { Notification } = require('../models');

module.exports = {
  async up() {
    const notifications = [
      // Mensaje 1: Ana → Lucía
      {
        sender_id: '11111111-1111-1111-1111-111111111111',
        receiver_id: '22222222-2222-2222-2222-222222222222',
        message: '¡Gracias por tu ayuda en la recogida de alimentos!',
        is_read: false,
      },
      // Mensaje 2: Ana → Miguel (ya leído)
      {
        sender_id: '11111111-1111-1111-1111-111111111111',
        receiver_id: '22222222-2222-2222-2222-222222222222',
        message: 'Recuerda traer guantes para la limpieza de playa.',
        is_read: true,
      },
      // Mensaje 3: Carlos → Sara
      {
        sender_id: '22222222-2222-2222-2222-222222222222',
        receiver_id: '11111111-1111-1111-1111-111111111111',
        message: 'Nos vemos a las 9:00 en el punto de encuentro.',
        is_read: false,
      },
      // Mensaje 4: Broadcast (sin receptor)
      {
        sender_id: '11111111-1111-1111-1111-111111111111',
        receiver_id: null,
        message: 'Se suspende la charla de hoy por lluvia.',
        is_read: false,
      },
    ];

    await Notification.bulkCreate(notifications, { returning: false });
  },

  async down() {
    await Notification.destroy({ truncate: true, cascade: true });
  },
};
