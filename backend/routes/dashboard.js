// backend/routes/dashboard.js
const express = require('express');
const authRequired = require('../middleware/authMiddleware');
// If you later have Event / Ticket / Order models, require them here.

const router = express.Router();

// GET /api/dashboard
router.get('/', authRequired, async (req, res) => {
  try {
    // For now, this is dummy data. Later you can query MongoDB using req.userId.
    const stats = {
      totalEvents: 3,
      totalAttendees: 120,
      revenue: 2450.75,
    };

    const upcomingEvents = [
      {
        id: 'evt1',
        name: 'Summer Music Festival',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        location: 'Jersey City, NJ',
      },
      {
        id: 'evt2',
        name: 'Tech Conference 2024',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'Newark, NJ',
      },
      {
        id: 'evt3',
        name: 'Comedy Night',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        location: 'New Brunswick, NJ',
      },
    ];

    res.json({ stats, upcomingEvents });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: 'Failed to load dashboard data.' });
  }
});

module.exports = router;

