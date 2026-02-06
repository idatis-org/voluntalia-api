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
exports.saveDocument = async (fileToSave) => {
  return await Document.create({
    user_id: fileToSave.user_id,
    filename: fileToSave.filename,
    mimetype: fileToSave.mimetype,
    storage_path: fileToSave.storage_path,
    category_id: fileToSave.category_id,
    type: fileToSave.type,
    resource_type_id: fileToSave.resource_type_id,
    size: fileToSave.size,
    description: fileToSave.description,
    format: fileToSave.format,
    tags: fileToSave.tags
  });
};

// ? Retrieve document record by ID (file existence not checked here)
exports.downloadDocument = async (id) => {
  const doc = await Document.findByPk(id);
  if (!doc) return null;

  doc.downloads += 1; 
  await doc.save();   

  return doc;
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

// * Delete document by ID
exports.deleteDocument = async (id) => {
  const document = await Document.findByPk(id);
  if (!document) {
    throw new NotFoundError("Document not found");
  }
  const rel = document.storage_path.split('\\files\\')[1];
  console.log(rel);
  console.log(process.env.PIVOT);
  const absoluteUrl = path.join(process.env.PIVOT, rel);

  fs.unlinkSync(absoluteUrl);

  await document.destroy();

};