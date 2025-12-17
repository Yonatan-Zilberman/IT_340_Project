/**
 * Authentication Middleware
 * Verify JWT token and attach user to request
 */

const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwtUtils');
const { AppError } = require('./errorHandler');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Middleware to verify JWT token and attach user to request
 */
async function authenticate(req, res, next) {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401));
    }

    // Get user from token
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return next(new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware to check if user has required role
 * @param {...string} roles - Allowed roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};

