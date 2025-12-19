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

        // Relación N-1 con Project
          this.belongsTo(models.Project, { as: 'project', foreignKey: 'project_id', onDelete: 'CASCADE' });
    }
  }

  Activity.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      created_by: { type: DataTypes.UUID, allowNull: false },
      project_id: { type: DataTypes.UUID, allowNull: false },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'planned',
        validate: { isIn: [['planned', 'active', 'completed', 'cancelled']] }
      }
    },
    {
      sequelize,
      modelName: 'Activity',
      tableName: 'activities',
      underscored: true,
      timestamps: true,
    }
  );

  return Activity;
};