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
  // * Build a URL, not an OS path: always use forward slashes regardless of
  // the platform (path.join would use backslashes on Windows, breaking the
  // resulting URL and any later parsing of it, e.g. in deleteDocument).
  const rest = oldPath.slice(pivot.length - 1).replace(/\\/g, '/');
  const base = filesPath.replace(/\/+$/, '');
  return `${base}${rest.startsWith('/') ? rest : '/' + rest}`;
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

  return doc;
};

// * Only called once the file has actually been served successfully
exports.incrementDownloads = async (id) => {
  await Document.increment('downloads', { where: { id } });
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
  // * Normalize to forward slashes first so this works regardless of which
  // platform originally wrote storage_path (see changePath).
  const normalized = document.storage_path.replace(/\\/g, '/');
  const rel = normalized.split('/files/')[1];
  const absoluteUrl = path.join(process.env.PIVOT, rel);

  try {
    fs.unlinkSync(absoluteUrl);
  } catch (err) {
    // * If the file is already gone, still let the DB record be cleaned up
    if (err.code !== 'ENOENT') throw err;
  }

  await document.destroy();
};