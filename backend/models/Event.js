/**
 * Event Model
 * Stores event information (concerts, sports, theater)
 */

const mongoose = require('mongoose');
const { EVENT_STATUS, EVENT_CATEGORIES } = require('../utils/constants');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    enum: Object.values(EVENT_CATEGORIES),
    required: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    default: '',
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(EVENT_STATUS),
    default: EVENT_STATUS.UPCOMING,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);

