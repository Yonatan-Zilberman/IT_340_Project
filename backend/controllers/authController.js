/**
 * Authentication Controller
 * Handles user registration, login, 2FA, and JWT token management
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const { generateOtp, getOtpExpiry, isOtpExpired } = require('../utils/otpUtils');
const { AppError } = require('../middleware/errorHandler');
const { clearRateLimit } = require('../middleware/rateLimiter');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, OTP_CONFIG } = require('../utils/constants');

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email is already registered.', 400));
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create and save user
    const newUser = new User({
      name,
      email,
      passwordHash,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_REGISTERED,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login - Step 1: Verify password and generate OTP
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 400));
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 400));
    }

    // Password is correct -> generate 2FA code
    const code = generateOtp();
    const expiresAt = new Date(getOtpExpiry());

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Create new OTP
    const otp = new OTP({
      email,
      code,
      expiresAt,
    });

    await otp.save();

    // Log for demo / debugging (this is your "simulated SMS/email")
    console.log(`2FA code for ${email}: ${code}`);

    // Prepare response
    const response = {
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      twoFactorRequired: true,
      email,
    };

    // For development/demo, always include OTP preview
    // In production, this would be sent via email/SMS instead
    const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    if (isDevelopment || process.env.SHOW_OTP === 'true') {
      response.otpPreview = code;
    }

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Verify 2FA code and generate JWT tokens
 * POST /api/auth/verify-2fa
 */
async function verify2FA(req, res, next) {
  try {
    const { email, code } = req.body;

    // Find OTP entry
    const otpEntry = await OTP.findOne({ email }).sort({ createdAt: -1 });
    
    if (!otpEntry) {
      return next(new AppError('No pending 2FA code for this email. Please log in again.', 400));
    }

    // Check expiration
    if (isOtpExpired(otpEntry.expiresAt.getTime())) {
      await OTP.deleteMany({ email });
      return next(new AppError('2FA code has expired. Please log in again.', 400));
    }

    // Check attempts
    if (otpEntry.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      await OTP.deleteMany({ email });
      return next(new AppError('Too many failed attempts. Please request a new 2FA code.', 400));
    }

    // Check code
    if (code !== otpEntry.code) {
      otpEntry.attempts += 1;
      await otpEntry.save();
      return next(new AppError('Invalid 2FA code.', 400));
    }

    // Code is valid -> get user and generate tokens
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404));
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Delete OTP after successful verification
    await OTP.deleteMany({ email });

    // Clear rate limit for this email since login was successful
    clearRateLimit(email);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.TWO_FA_SUCCESS,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    // User is attached to request by authMiddleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout (client-side token removal, but included for completeness)
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    // In a stateless JWT system, logout is handled client-side
    // This endpoint is for consistency and potential future token blacklisting
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  verify2FA,
  getMe,
  logout,
};

