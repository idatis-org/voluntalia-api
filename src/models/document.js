'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      // Un documento pertenece a un usuario
      this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    }
  }

  Document.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      filename: { type: DataTypes.TEXT, allowNull: false },
      mimetype: { type: DataTypes.TEXT, allowNull: false },
      storage_path: { type: DataTypes.TEXT, allowNull: false },
      type: { type: DataTypes.TEXT, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: true },
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