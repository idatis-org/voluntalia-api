// * Express middleware factory: validates req.body against a Zod schema.
// On success, replaces req.body with the parsed (and coerced) data.
// On failure, responds 400 with an array of "path: message" strings.
module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const messages = result.error.issues.map(
      (issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`
    );
    return res.status(400).json({ error: messages });
  }

  req.body = result.data;
  next();
};
