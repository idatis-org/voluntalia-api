'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkLog extends Model {
    static associate(models) {
      this.belongsTo(models.User,     { foreignKey: 'user_id',     onDelete: 'CASCADE' });
      this.belongsTo(models.Activity, { as: 'activity', foreignKey: 'activity_id', onDelete: 'SET NULL' });
        this.belongsTo(models.User, { as: 'approvedBy', foreignKey: 'approved_by', onDelete: 'SET NULL' });
    }
  }

  WorkLog.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id:     { type: DataTypes.UUID, allowNull: false },
      activity_id: { type: DataTypes.UUID, allowNull: true },
      status:       { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending', validate: { isIn: [['pending','approved','cancelled']] } },
      approved_by:  { type: DataTypes.UUID, allowNull: true },
      approved_at:  { type: DataTypes.DATE, allowNull: true },
      week_start:  { type: DataTypes.DATEONLY, allowNull: false },
      hours:       { type: DataTypes.STRING, allowNull: false },
      notes:       { type: DataTypes.TEXT }
    },
    {
      sequelize,
      modelName: 'WorkLog',
      tableName: 'work_logs',
      underscored: true,
      timestamps: true,
    }
  );

  return WorkLog;
};