/**
 * Ticket Model
 * Stores ticket listings for events
 */

const mongoose = require('mongoose');
const { TICKET_STATUS } = require('../utils/constants');

const ticketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  section: {
    type: String,
    required: true,
    trim: true,
  },
  row: {
    type: String,
    trim: true,
    default: '',
  },
  seat: {
    type: String,
    trim: true,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: Object.values(TICKET_STATUS),
    default: TICKET_STATUS.AVAILABLE,
    index: true,
  },
  listingDate: {
    type: Date,
    default: Date.now,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  purchaseDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
ticketSchema.index({ eventId: 1, status: 1 });
ticketSchema.index({ sellerId: 1, status: 1 });
ticketSchema.index({ buyerId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);

