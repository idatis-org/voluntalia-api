'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un usuario puede crear muchas actividades
      User.hasMany(models.Activity, {
        as: 'createdActivities',
        foreignKey: 'created_by',
      });

      User.hasMany(models.WorkLog, {
        as: 'workLogs',
        foreignKey: 'user_id', // Make sure this matches your WorkLog model
      });

      // Un usuario puede apuntarse a muchas actividades (N-N)
      User.belongsToMany(models.Activity, {
        as: 'volunteerActivities',
        through: 'activity_volunteers',
        foreignKey: 'volunteer_id',
        otherKey: 'activity_id',
        timestamps: false,
      });

      User.belongsToMany(models.Skill, {
        as: 'skills',
        through: 'skills_volunteers',
        foreignKey: 'volunteer_id',
        otherKey: 'skill_id',
        timestamps: false,
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.TEXT, allowNull: false },
      email: { type: DataTypes.TEXT, allowNull: false, unique: true },
      password_hash: { type: DataTypes.TEXT, allowNull: false },
      role: {
        type: DataTypes.ENUM('COORDINATOR', 'VOLUNTEER', 'LEGAL'),
        allowNull: false,
        defaultValue: 'VOLUNTEER',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
    }
  );
  return User;
};
