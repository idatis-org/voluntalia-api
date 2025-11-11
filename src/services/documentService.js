const { NotFoundError } = require("../errors/errorTypes");
const path = require("path");
require('dotenv').config();
const fs = require("fs");
const { Document } = require("../models");
const { Category } = require("../models");
const { ResourceType } = require("../models");

exports.changePath = (oldPath) => {
  const filesPath = process.env.FILES_PATH;
  if (!filesPath) {
    throw new Error("FILES_PATH not defined in .env");
  }

  const pivot = process.env.PIVOT;                           
  const rest = oldPath.slice(pivot.length -1); 

  return path.join(filesPath, rest);
};

exports.getAllDocuments = async () => {
  const documents =  await Document.findAll();

  return documents;
};

// * Persist document metadata in the database
exports.saveDocument = async (user_id, filename, mimetype, storage_path, type) => {
  return await Document.create({
    user_id,
    filename,
    mimetype,
    storage_path,
    type,
    description: 'PRUEBA'
  });
};

// ? Retrieve document record by ID (file existence not checked here)
exports.downloadDocument = async (id) => {
  return await Document.findByPk(id);
};

// * Fetch all document categories
exports.getCategories = async () => {
  const categories = await Category.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });
  return categories;
};
// * Fetch all document types (distinct values from documents table)
exports.getTypes = async () => {
  const types = await ResourceType.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });
  return types;
}