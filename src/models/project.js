'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // Manager (User)
      this.belongsTo(models.User, { as: 'manager', foreignKey: 'manager_id' });

      // Volunteers (many-to-many)
      this.belongsToMany(models.User, {
        through: 'project_volunteers',
        as: 'volunteers',
        foreignKey: 'project_id',
        otherKey: 'user_id',
        timestamps: false
      });

      // Activities
      this.hasMany(models.Activity, { as: 'activities', foreignKey: 'project_id' });
    }
  }

  Project.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      manager_id: { type: DataTypes.UUID, allowNull: false },
      created_by: { type: DataTypes.UUID, allowNull: false },
      start_date: { type: DataTypes.DATEONLY },
      end_date: { type: DataTypes.DATEONLY },
      
    },
    {
      sequelize,
      modelName: 'Project',
      tableName: 'projects',
      underscored: true,
      timestamps: true
    }
  );

  // Associations to user: creator
  Project.associate = function(models) {
    Project.belongsTo(models.User, { as: 'creator', foreignKey: 'created_by', onDelete: 'RESTRICT' });
  };

  return Project;
};
