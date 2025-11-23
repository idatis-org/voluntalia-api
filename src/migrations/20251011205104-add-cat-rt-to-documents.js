'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('documents', 'category_id', {
      type: DataTypes.UUID,
      references: { model: 'categories_documents', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('documents', 'resource_type_id', {
      type: DataTypes.UUID,
      references: { model: 'resource_types_documents', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('documents', 'description', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    });
    await queryInterface.addColumn('documents', 'format', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    });
    await queryInterface.addColumn('documents', 'size', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    });
    await queryInterface.addColumn('documents', 'downloads', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('documents', 'category_id');
    await queryInterface.removeColumn('documents', 'resource_type_id');
    await queryInterface.removeColumn('documents', 'description');
    await queryInterface.removeColumn('documents', 'format');
    await queryInterface.removeColumn('documents', 'size');
    await queryInterface.removeColumn('documents', 'downloads');
  },
};
