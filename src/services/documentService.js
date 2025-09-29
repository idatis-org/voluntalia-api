const { NotFoundError } = require("../errors/ErrorTypes");
const path = require("path");
const fs = require("fs");
const { Document } = require("../models");

// * Persist document metadata in the database
exports.saveDocument = async (user_id, filename, mimetype, storage_path, type) => {
  return await Document.create({
    user_id,
    filename,
    mimetype,
    storage_path,
    type,
  });
};

// ? Retrieve document record by ID (file existence not checked here)
exports.downloadDocument = async (id) => {
  return await Document.findByPk(id);
};