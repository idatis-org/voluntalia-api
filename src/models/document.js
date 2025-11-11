'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      // Un documento pertenece a un usuario
      this.belongsTo(models.User,         { foreignKey: 'user_id', onDelete: 'CASCADE' });
      this.belongsTo(models.Category,     { foreignKey: 'category_id' });
      this.belongsTo(models.ResourceType, { foreignKey: 'resource_type_id' });
    }
  }

  Document.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id:          { type: DataTypes.UUID, allowNull: false },
      filename:         { type: DataTypes.TEXT, allowNull: false },
      mimetype:         { type: DataTypes.TEXT, allowNull: false },
      storage_path:     { type: DataTypes.TEXT, allowNull: false },
      type:             { type: DataTypes.TEXT, allowNull: false },
      created_at:       { type: DataTypes.DATE, allowNull: true },
      category_id:      { type: DataTypes.UUID, allowNull: true },
      resource_type_id: { type: DataTypes.UUID, allowNull: true },
      description:      { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
      format:           { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
      size:             { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
      downloads:        { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'Document',
      tableName: 'documents',
      underscored: true,
      timestamps: false,
    }
  );

  return Document;
};