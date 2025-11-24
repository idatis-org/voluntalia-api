'use strict';
const { Activity } = require('../models');

module.exports = {
  async up() {
    // IDs de los COORDINADORES que crearon las actividades
    const anaId = '11111111-1111-1111-1111-111111111111';
    const carlosId = '22222222-2222-2222-2222-222222222222';

    const activities = [
      {
        title: 'Recogida de alimentos',
        description: 'Campo de alimentos para familias vulnerables.',
        date: '2024-09-02',
        created_by: anaId,
      },
      {
        title: 'Clases de apoyo escolar',
        description: 'Refuerzo escolar en matemáticas para niños de primaria.',
        date: '2024-09-09',
        created_by: anaId,
      },
      {
        title: 'Jornada de limpieza de playa',
        description: 'Recogida de residuos en la playa de la Malvarrosa.',
        date: '2024-09-14',
        created_by: carlosId,
      },
      {
        title: 'Taller de empleo',
        description:
          'Capacitación en habilidades digitales para la búsqueda de empleo.',
        date: '2024-09-21',
        created_by: carlosId,
      },
      {
        title: 'Charla sobre voluntariado',
        description: 'Presentación abierta para nuevos voluntarios.',
        date: '2024-09-28',
        created_by: anaId,
      },
      {
        title: 'Proyecto de VoluntALIA',
        description:
          'Creación de una aplicación web donde se pueda gestionar a todos los voluntarios de IDATIS',
        date: '2024-09-28',
        created_by: anaId,
      },
    ];

    await Activity.bulkCreate(activities, { returning: false });
  },

  async down() {
    await Activity.destroy({ truncate: true, cascade: true });
  },
};
