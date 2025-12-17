/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { otpRateLimiter } = require('../middleware/rateLimiter');
const { validateRequired, validateEmail, validatePassword } = require('../middleware/validator');

// POST /api/auth/register
router.post(
  '/register',
  validateRequired('name', 'email', 'password'),
  validateEmail,
  validatePassword(6),
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  validateRequired('email', 'password'),
  validateEmail,
  otpRateLimiter,
  authController.login
);

// POST /api/auth/verify-2fa
router.post(
  '/verify-2fa',
  validateRequired('email', 'code'),
  validateEmail,
  authController.verify2FA
);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;

