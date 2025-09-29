const jwt = require('jsonwebtoken');

/**
 * JWT-based authentication and authorization middleware.
 *
 * * requireAuth      – Validate the Bearer token and attach the decoded payload to req.user
 * * authorizeRoles   – Allows you to restrict routes to specific roles (e.g., ‘COORDINATOR’, ‘VOLUNTEER’)
 * *                    Use after requireAuth to ensure that req.user exists
 */

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' '); // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = payload; // { sub, role, email, name }
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorizeRoles(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { requireAuth, authorizeRoles };
