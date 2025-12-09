'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasOne(models.Document, { foreignKey: 'category_id' });
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories_documents',
      underscored: true,
      timestamps: false,
    }
  );

  return Category;
};