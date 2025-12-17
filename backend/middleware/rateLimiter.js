/**
 * Rate Limiting Middleware
 * Prevent abuse of authentication endpoints
 */

const { OTP_CONFIG } = require('../utils/constants');

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = {};

/**
 * Clean up expired entries from rate limit store
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].expiresAt < now) {
      delete rateLimitStore[key];
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Rate limiter for OTP generation
 * Limits OTP requests per email address
 */
function otpRateLimiter(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return next();
  }

  const key = `otp:${email}`;
  const now = Date.now();
  const windowStart = now - OTP_CONFIG.RATE_LIMIT_WINDOW;

  // Clean up old entries
  if (rateLimitStore[key] && rateLimitStore[key].expiresAt < now) {
    delete rateLimitStore[key];
  }

  // Check if entry exists
  if (rateLimitStore[key]) {
    // Filter out requests outside the window
    rateLimitStore[key].requests = rateLimitStore[key].requests.filter(
      timestamp => timestamp > windowStart
    );

    // Check if limit exceeded
    if (rateLimitStore[key].requests.length >= OTP_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.ceil((rateLimitStore[key].requests[0] + OTP_CONFIG.RATE_LIMIT_WINDOW - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `Too many OTP requests. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
        retryAfter: retryAfter
      });
    }

    // Add current request
    rateLimitStore[key].requests.push(now);
  } else {
    // Create new entry
    rateLimitStore[key] = {
      requests: [now],
      expiresAt: now + OTP_CONFIG.RATE_LIMIT_WINDOW
    };
  }

  next();
}

/**
 * Clear rate limit for an email (call after successful 2FA verification)
 */
function clearRateLimit(email) {
  const key = `otp:${email}`;
  if (rateLimitStore[key]) {
    delete rateLimitStore[key];
  }
}

module.exports = {
  otpRateLimiter,
  clearRateLimit
};

