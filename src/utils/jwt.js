const jwt = require('jsonwebtoken');

// Config to sign access token
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || '30d'
  });
}

// Config to sign refresh access token
function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_TTL || '30d'
  });
}

// Verify access token
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

// Verify refresh access token
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
