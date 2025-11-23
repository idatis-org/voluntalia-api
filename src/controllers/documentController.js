const documentService = require("../services/documentService");
const fs = require("fs").promises;
const path = require("path");
const https   = require('https');   // usa require('http') si es HTTP
const url     = require('url');

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
    console.log(req.customer);
    if (!req.file)
      return res.status(400).json({ error: "No file or invalid type" });
    console.log(req.body);
    const sub = req.user.sub;
    filePath = documentService.changePath(req.file.path);
    const fileToSave = {
      user_id: sub,
      filename: req.body.filename || req.file.originalname,
      description: req.body.description || '',
      mimetype: req.file.mimetype,
      storage_path: filePath,
      category_id: req.body.category_id,
      type: req.body.type,
      resource_type_id: req.body.resource_type_id,
      size: req.file.size,
      format: req.body.format,
      tags: req.body.tags || ''
    };
    console.log(fileToSave);
    // * Persist document info in DB
    const document = await documentService.saveDocument(fileToSave);
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
    const fileUrl = doc.storage_path.replace(/\\/g, '/');

    const parsed = new url.URL(fileUrl);
    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method:   'GET',
    };
    console.log(options);

    const proxyReq = (parsed.protocol === 'https:' ? https : require('http'))
                      .request(options, (remoteRes) => {

      if (remoteRes.statusCode !== 200) {
        return res.sendStatus(remoteRes.statusCode);
      }

      res.set('Content-Type', remoteRes.headers['content-type'] || doc.mimetype);

      const safeName = encodeURIComponent(doc.filename).replace(/['"]/g, '');
      res.set('Content-Disposition', `attachment; filename="${safeName}"`);

      if (remoteRes.headers['content-length']) {
        res.set('Content-Length', remoteRes.headers['content-length']);
      }

      res.set('Access-Control-Expose-Headers', 'Content-Disposition');

      remoteRes.pipe(res);
    });
    proxyReq.on('error', next);   // si falla la conexión
    proxyReq.end();
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

exports.deleteDocument = async (req, res, next) => {
  try {
    const id = req.params.id;
    await documentService.deleteDocument(id);

    res.json({ message: 'resource delete' });
  } catch (err) {
    next(err);
  }
};