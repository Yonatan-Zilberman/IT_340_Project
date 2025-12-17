/**
 * Event Routes
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);

// Protected routes (organizer/admin only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.ORGANIZER, ROLES.ADMIN),
  eventController.createEvent
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ORGANIZER, ROLES.ADMIN),
  eventController.updateEvent
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ORGANIZER, ROLES.ADMIN),
  eventController.deleteEvent
);

module.exports = router;

