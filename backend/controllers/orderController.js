/**
 * Order Controller
 * Handles CRUD operations for orders
 */

const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const { AppError } = require('../middleware/errorHandler');
const { ERROR_MESSAGES, ORDER_STATUS, TICKET_STATUS } = require('../utils/constants');

/**
 * Get user's orders
 * GET /api/orders
 */
async function getOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query - only user's orders
    const query = { buyerId: req.user._id };
    if (status && Object.values(ORDER_STATUS).includes(status)) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const orders = await Order.find(query)
      .populate({
        path: 'tickets',
        populate: {
          path: 'eventId',
          select: 'name date venue category',
        },
      })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single order by ID
 * GET /api/orders/:id
 */
async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'tickets',
        populate: {
          path: 'eventId',
        },
      })
      .populate('buyerId', 'name email');

    if (!order) {
      return next(new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, 404));
    }

    // Check if user is the buyer
    if (order.buyerId._id.toString() !== req.user._id.toString()) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create new order
 * POST /api/orders
 */
async function createOrder(req, res, next) {
  try {
    const { ticketIds, paymentMethod = 'credit_card' } = req.body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return next(new AppError('Please provide at least one ticket ID.', 400));
    }

    // Verify all tickets exist and are available
    const tickets = await Ticket.find({
      _id: { $in: ticketIds },
      status: TICKET_STATUS.AVAILABLE,
    });

    if (tickets.length !== ticketIds.length) {
      return next(new AppError('One or more tickets are not available.', 400));
    }

    // Calculate total amount
    const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

    // Create order
    const order = new Order({
      buyerId: req.user._id,
      tickets: ticketIds,
      totalAmount,
      paymentMethod,
      status: ORDER_STATUS.PENDING,
    });

    await order.save();

    // Update ticket statuses
    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      {
        status: TICKET_STATUS.SOLD,
        buyerId: req.user._id,
        purchaseDate: new Date(),
      }
    );

    // Update order status to completed
    order.status = ORDER_STATUS.COMPLETED;
    await order.save();

    await order.populate({
      path: 'tickets',
      populate: {
        path: 'eventId',
        select: 'name date venue category',
      },
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 */
async function cancelOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, 404));
    }

    // Check if user is the buyer
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    // Can only cancel pending orders
    if (order.status !== ORDER_STATUS.PENDING) {
      return next(new AppError('Only pending orders can be cancelled.', 400));
    }

    // Update order status
    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    // Make tickets available again
    await Ticket.updateMany(
      { _id: { $in: order.tickets } },
      {
        status: TICKET_STATUS.AVAILABLE,
        buyerId: null,
        purchaseDate: null,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
};

