/**
 * OTP Utility Functions
 * Secure OTP generation using crypto module
 */

const crypto = require('crypto');
const { OTP_CONFIG } = require('./constants');

/**
 * Generate a secure 6-digit OTP using crypto
 * @returns {string} 6-digit OTP code
 */
function generateOtp() {
  // Generate random bytes and convert to 6-digit number
  const randomBytes = crypto.randomBytes(3);
  const randomNumber = randomBytes.readUIntBE(0, 3);
  // Ensure it's 6 digits (100000 to 999999)
  const otp = (100000 + (randomNumber % 900000)).toString();
  return otp;
}

/**
 * Calculate OTP expiration timestamp
 * @returns {number} Unix timestamp in milliseconds
 */
function getOtpExpiry() {
  return Date.now() + (OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
}

/**
 * Check if OTP is expired
 * @param {number} expiresAt - Expiration timestamp
 * @returns {boolean} True if expired
 */
function isOtpExpired(expiresAt) {
  return Date.now() > expiresAt;
}

module.exports = {
  generateOtp,
  getOtpExpiry,
  isOtpExpired
};

