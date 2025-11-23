'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Skill extends Model {
    static associate(models) {
      // N-N con User  (a través de user_skills)
      Skill.belongsToMany(models.User, {
        as: 'volunteers',
        through: 'skills_volunteers',
        foreignKey: 'skill_id',
        otherKey: 'volunteer_id',
        timestamps: false,
      });
    }
  }

  Skill.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      created_by: { type: DataTypes.UUID, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Skill',
      tableName: 'skills',
      underscored: true,
      timestamps: false,
    }
  );

  return Skill;
};
