/**
 * OTP Model
 * Stores two-factor authentication codes with TTL index
 */

const mongoose = require('mongoose');
const { OTP_CONFIG } = require('../utils/constants');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL index for auto-cleanup
  },
  attempts: {
    type: Number,
    default: 0,
    max: OTP_CONFIG.MAX_ATTEMPTS,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups
otpSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('OTP', otpSchema);

