/**
 * Event Controller
 * Handles CRUD operations for events
 */

const Event = require('../models/Event');
const { AppError } = require('../middleware/errorHandler');
const { ERROR_MESSAGES, EVENT_CATEGORIES, EVENT_STATUS } = require('../utils/constants');

/**
 * Get all events with filtering and pagination
 * GET /api/events
 */
async function getEvents(req, res, next) {
  try {
    const { category, status, page = 1, limit = 10, sort = 'date' } = req.query;
    
    // Build query
    const query = {};
    if (category && Object.values(EVENT_CATEGORIES).includes(category)) {
      query.category = category;
    }
    if (status && Object.values(EVENT_STATUS).includes(status)) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    let sortObj = { date: 1 }; // Default: ascending by date
    if (sort === 'date-desc') {
      sortObj = { date: -1 };
    } else if (sort === 'name') {
      sortObj = { name: 1 };
    }

    // Execute query
    const events = await Event.find(query)
      .populate('organizerId', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: events,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single event by ID
 * GET /api/events/:id
 */
async function getEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'name email');

    if (!event) {
      return next(new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, 404));
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create new event
 * POST /api/events
 */
async function createEvent(req, res, next) {
  try {
    // Add organizerId from authenticated user
    const eventData = {
      ...req.body,
      organizerId: req.user._id,
    };

    const event = new Event(eventData);
    await event.save();

    await event.populate('organizerId', 'name email');

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update event
 * PUT /api/events/:id
 */
async function updateEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, 404));
    }

    // Check if user is organizer or admin
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    // Update event
    Object.keys(req.body).forEach(key => {
      if (key !== 'organizerId') { // Prevent changing organizer
        event[key] = req.body[key];
      }
    });

    await event.save();
    await event.populate('organizerId', 'name email');

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete event
 * DELETE /api/events/:id
 */
async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, 404));
    }

    // Check if user is organizer or admin
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};

