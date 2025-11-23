'use strict';
const { v4: uuid } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    // 1. Categorías
    await queryInterface.bulkInsert('categories_documents', [
      { id: uuid(), name: 'Legal' },
      { id: uuid(), name: 'Health' },
      { id: uuid(), name: 'Education' },
      { id: uuid(), name: 'Logistics' },
    ]);

    // 2. ResourceTypes
    await queryInterface.bulkInsert('resource_types_documents', [
      { id: uuid(), name: 'document' },
      { id: uuid(), name: 'video' },
      { id: uuid(), name: 'course' },
      { id: uuid(), name: 'template' },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories_documents', null, {});
    await queryInterface.bulkDelete('resource_types_documents', null, {});
  },
};
