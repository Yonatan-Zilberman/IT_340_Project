/**
 * Ticket Routes
 */

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicket);

// Protected routes
router.post('/', authenticate, ticketController.createTicket);
router.put('/:id', authenticate, ticketController.updateTicket);
router.delete('/:id', authenticate, ticketController.deleteTicket);
router.post('/:id/purchase', authenticate, ticketController.purchaseTicket);

module.exports = router;

