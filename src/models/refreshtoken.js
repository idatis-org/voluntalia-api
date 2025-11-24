// src/models/refreshtoken.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
      });
    }
  }
  RefreshToken.init(
    {
      token: { type: DataTypes.TEXT, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      underscored: true,
      timestamps: false,
    }
  );
  return RefreshToken;
};
