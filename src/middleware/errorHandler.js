const { UniqueConstraintError, ValidationError } = require('sequelize');
const { MulterError } = require('multer');
const ConflictError = require('../errors/errorTypes');

module.exports = (err, _req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  // Sequelize errors
  if (err instanceof UniqueConstraintError) {
    // Duplicated
    return res.status(409).json({ error: 'Duplicated entry' });
  }

  // Multer errors (e.g. file too large)
  if (err instanceof MulterError) {
    console.error(`[Error 400]`, err.message);
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof ValidationError) {
    // Collect messages from each field
    console.error(`[Error ${status}]`, err.message, err.stack);
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ error: messages });
  }

  // Semantic errors
  if (err.status) {
    console.error(`[Error ${status}]`, err.message, err.stack);
    return res.status(err.status).json({ error: err.message });
  }

  // Fallback
  console.error(`[Error ${status}]`, err.message, err.stack);
  return res.status(500).json({ error: 'Internal error' });
};