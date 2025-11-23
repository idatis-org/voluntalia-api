'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {
      // Relación 1-N con creador
      this.belongsTo(models.User, { as: 'creator', foreignKey: 'created_by' });

      // Relación N-N con voluntarios
      this.belongsToMany(models.User, {
        as: 'volunteers',
        through: 'activity_volunteers',
        foreignKey: 'activity_id',
        otherKey: 'volunteer_id',
        timestamps: false,
      });
    }
  }

  Activity.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      created_by: { type: DataTypes.UUID, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Activity',
      tableName: 'activities',
      underscored: true,
      timestamps: false,
    }
  );

  return Activity;
};
