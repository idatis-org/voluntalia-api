const documentService = require("../services/documentService");
const fs = require("fs").promises;
const path = require("path");

exports.getAllDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getAllDocuments();
    res.status(200).json({ documents });
  } catch (err) {
    next(err);
  }
};

// * Save uploaded file metadata and return the new document record
exports.saveDocument = async (req, res, next) => {
  let filePath = null;
  try {
    // ! Ensure a valid file was uploaded
    if (!req.file)
      return res.status(400).json({ error: "No file or invalid type" });

    const { type = "OTHER" } = req.body;
    const sub = req.user.sub;
    const { originalname, mimetype, filename, path } = req.file;
    filePath = documentService.changePath(path);

    // * Persist document info in DB
    const document = await documentService.saveDocument(
      sub,
      originalname,
      mimetype,
      filePath,
      type
    );
    res.status(201).json({ document });
  } catch (err) {
    // ! Clean up leftover file on failure
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkErr) {
        console.error("Error deleting file after failure:", unlinkErr);
      }
    }
    next(err);
  }
};

// * Stream file download for an existing document
exports.downloadDocument = async (req, res, next) => {
  try {
    const id = req.params.id;
    const doc = await documentService.downloadDocument(id);

    // ? If document or file not found, return 404
    if (doc) res.download(doc.storage_path, doc.filename);
    else res.status(404).json({ error: "File not found" });
  } catch (err) {
    next(err);
  }
};

// * Fetch all document categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await documentService.getCategories();
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  } 
}

// * Fetch all document types
exports.getTypes = async (req, res, next) => {
  try {
    const types = await documentService.getTypes();
    res.status(200).json({ types });
  } catch (err) {
    next(err);
  } 
};