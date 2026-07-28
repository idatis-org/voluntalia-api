'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // emisor
      this.belongsTo(models.User, {
        as: 'sender',
        foreignKey: 'sender_id',
      });
      // receptor (puede ser null)
      this.belongsTo(models.User, {
        as: 'receiver',
        foreignKey: 'receiver_id',
      });
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sender_id: { type: DataTypes.UUID, allowNull: false },
      receiver_id: { type: DataTypes.UUID, allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: false },
      is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      underscored: true,
      timestamps: false, // no hay updated_at; created_at se declara arriba a mano
    }
  );

  return Notification;
};