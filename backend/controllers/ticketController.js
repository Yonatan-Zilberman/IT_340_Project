/**
 * Ticket Controller
 * Handles CRUD operations for tickets
 */

const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { AppError } = require('../middleware/errorHandler');
const { ERROR_MESSAGES, TICKET_STATUS } = require('../utils/constants');

/**
 * Get all tickets with filtering
 * GET /api/tickets
 */
async function getTickets(req, res, next) {
  try {
    const { eventId, status, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (eventId) {
      query.eventId = eventId;
    }
    if (status && Object.values(TICKET_STATUS).includes(status)) {
      query.status = status;
    } else {
      // Default: only show available tickets
      query.status = TICKET_STATUS.AVAILABLE;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const tickets = await Ticket.find(query)
      .populate('eventId', 'name date venue category')
      .populate('sellerId', 'name email')
      .sort({ listingDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single ticket by ID
 * GET /api/tickets/:id
 */
async function getTicket(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('eventId')
      .populate('sellerId', 'name email')
      .populate('buyerId', 'name email');

    if (!ticket) {
      return next(new AppError(ERROR_MESSAGES.TICKET_NOT_FOUND, 404));
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create new ticket listing
 * POST /api/tickets
 */
async function createTicket(req, res, next) {
  try {
    // Verify event exists
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      return next(new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, 404));
    }

    // Create ticket
    const ticketData = {
      ...req.body,
      sellerId: req.user._id,
      status: TICKET_STATUS.AVAILABLE,
    };

    const ticket = new Ticket(ticketData);
    await ticket.save();

    await ticket.populate('eventId', 'name date venue');
    await ticket.populate('sellerId', 'name email');

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update ticket listing
 * PUT /api/tickets/:id
 */
async function updateTicket(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError(ERROR_MESSAGES.TICKET_NOT_FOUND, 404));
    }

    // Check if user is seller
    if (ticket.sellerId.toString() !== req.user._id.toString()) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    // Can't update sold tickets
    if (ticket.status === TICKET_STATUS.SOLD) {
      return next(new AppError('Cannot update a sold ticket.', 400));
    }

    // Update ticket
    Object.keys(req.body).forEach(key => {
      if (key !== 'sellerId' && key !== 'buyerId' && key !== 'purchaseDate') {
        ticket[key] = req.body[key];
      }
    });

    await ticket.save();
    await ticket.populate('eventId', 'name date venue');
    await ticket.populate('sellerId', 'name email');

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete ticket listing
 * DELETE /api/tickets/:id
 */
async function deleteTicket(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError(ERROR_MESSAGES.TICKET_NOT_FOUND, 404));
    }

    // Check if user is seller
    if (ticket.sellerId.toString() !== req.user._id.toString()) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    // Can't delete sold tickets
    if (ticket.status === TICKET_STATUS.SOLD) {
      return next(new AppError('Cannot delete a sold ticket.', 400));
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Ticket listing deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Purchase ticket
 * POST /api/tickets/:id/purchase
 */
async function purchaseTicket(req, res, next) {
  try {
    const Order = require('../models/Order');
    const { ORDER_STATUS } = require('../utils/constants');
    
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError(ERROR_MESSAGES.TICKET_NOT_FOUND, 404));
    }

    // Check if ticket is available
    if (ticket.status !== TICKET_STATUS.AVAILABLE) {
      return next(new AppError('Ticket is not available for purchase.', 400));
    }

    // Can't buy your own ticket
    if (ticket.sellerId.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot purchase your own ticket listing.', 400));
    }

    // Update ticket status
    ticket.status = TICKET_STATUS.SOLD;
    ticket.buyerId = req.user._id;
    ticket.purchaseDate = new Date();

    await ticket.save();

    // Create order for this purchase
    const order = new Order({
      buyerId: req.user._id,
      tickets: [ticket._id],
      totalAmount: ticket.price,
      status: ORDER_STATUS.COMPLETED,
      orderDate: new Date(),
      paymentMethod: 'credit_card', // Fictional payment method
    });

    await order.save();

    // Populate order with ticket and event details
    await order.populate({
      path: 'tickets',
      populate: {
        path: 'eventId',
        select: 'name date venue category',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Ticket purchased successfully',
      data: {
        ticket,
        order,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  purchaseTicket,
};

