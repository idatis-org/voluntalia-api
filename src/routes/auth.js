const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  register,
  login,
  refresh,
  logout,
  me,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register); // * Registration of new users
router.post('/login', login); // * Inicio de sesión con credenciales
router.post('/refresh', refresh); // ? Renueva el token de acceso usando
// Reset password
router.post('/reset-password', resetPassword);
// Protected routes (authentication         required)
router.post('/logout', logout); // * Log out and invalidate tokens
router.get('/me', requireAuth, me); // ? Obtains information about the authenticated user

module.exports = router;
