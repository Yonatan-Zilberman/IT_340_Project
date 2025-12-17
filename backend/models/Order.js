/**
 * Order Model
 * Stores purchase orders for tickets
 */

const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../utils/constants');

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING,
    index: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: 'credit_card', // Fictional payment method
  },
}, {
  timestamps: true,
});

// Index for faster queries
orderSchema.index({ buyerId: 1, orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);

