'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    }
  }

  UserPreference.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
      email_notifications: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      push_notifications: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      sms_notifications: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      event_notifications: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      update_notifications: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      language: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'en' },
      timezone: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'America/New_York' },
      date_format: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'MM/DD/YYYY' },
    },
    {
      sequelize,
      modelName: 'UserPreference',
      tableName: 'user_preferences',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return UserPreference;
};
