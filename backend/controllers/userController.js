/**
 * User Controller
 * Handles user profile operations
 */

const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { AppError } = require('../middleware/errorHandler');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Get current user profile
 * GET /api/users/profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user profile
 * PUT /api/users/profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) {
      user.name = name;
    }
    if (phone !== undefined) {
      user.phone = phone;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user's ticket listings
 * GET /api/users/:id/listings
 */
async function getUserListings(req, res, next) {
  try {
    const userId = req.params.id || req.user._id;

    // Check if user is viewing their own listings or is admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    const tickets = await Ticket.find({ sellerId: userId })
      .populate('eventId', 'name date venue category')
      .sort({ listingDate: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getUserListings,
};

