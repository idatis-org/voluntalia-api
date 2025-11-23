'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ResourceType extends Model {
    static associate(models) {
      ResourceType.hasOne(models.Document, { foreignKey: 'resource_type_id' });
    }
  }

  ResourceType.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      sequelize,
      modelName: 'ResourceType',
      tableName: 'resource_types_documents',
      underscored: true,
      timestamps: false,
    }
  );

  return ResourceType;
};
