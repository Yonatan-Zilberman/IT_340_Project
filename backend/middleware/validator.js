/**
 * Request Validation Middleware
 * Validate request body, params, and query
 */

const { AppError } = require('./errorHandler');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Validate required fields in request body
 * @param {...string} fields - Required field names
 */
function validateRequired(...fields) {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return next(new AppError(
        `Missing required fields: ${missing.join(', ')}`,
        400
      ));
    }
    
    next();
  };
}

/**
 * Validate email format
 */
function validateEmail(req, res, next) {
  const { email } = req.body;
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Invalid email format', 400));
    }
  }
  
  next();
}

/**
 * Validate password strength
 * @param {number} minLength - Minimum password length
 */
function validatePassword(minLength = 6) {
  return (req, res, next) => {
    const { password } = req.body;
    
    if (password && password.length < minLength) {
      return next(new AppError(
        `Password must be at least ${minLength} characters long`,
        400
      ));
    }
    
    next();
  };
}

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword
};

