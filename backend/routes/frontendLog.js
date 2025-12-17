const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Path to frontend log file
const frontendLogPath = path.join(__dirname, '..', 'logs', 'frontend.log');

router.post('/', (req, res) => {
  const { level = 'info', message = '', context = {} } = req.body || {};

  // Build a simple JSON log line
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    context,
  };

  fs.appendFile(frontendLogPath, JSON.stringify(entry) + '\n', (err) => {
    if (err) {
      console.error('Error writing frontend log:', err.message);
      return res.status(500).json({ message: 'Failed to write log' });
    }
    return res.status(201).json({ message: 'Log recorded' });
  });
});

module.exports = router;
