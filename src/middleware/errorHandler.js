const { UniqueConstraintError, ValidationError } = require('sequelize');

module.exports = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  // Sequelize unique constraint -> give more context
  if (err instanceof UniqueConstraintError) {
    const fields = err.fields || {};
    let message = 'Duplicated entry';
    try {
      const path = req && req.path ? req.path : '';
      // Project name uniqueness
      if (fields.name && path.startsWith('/projects')) {
        message = 'project name already exists';
      } else if (fields.title && fields.project_id && path.startsWith('/activity')) {
        message = 'activity with same title already exists in project';
      } else if (Object.keys(fields).length) {
        message = `Duplicate value for fields: ${Object.keys(fields).join(', ')}`;
      }
    } catch (e) {
      message = 'Duplicated entry';
    }

    return res.status(409).json({ error: message });
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
    if (process.env.NODE_ENV !== 'production') {
      return res.status(err.status).json({ error: err.message, stack: err.stack });
    }
    return res.status(err.status).json({ error: err.message });
  }

  // Fallback
  console.error(`[Error ${status}]`, err.message, err.stack);
  if (process.env.NODE_ENV !== 'production') {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
  return res.status(500).json({ error: 'Internal error' });
};