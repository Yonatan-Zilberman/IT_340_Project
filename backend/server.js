const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();

// Create a write stream (in append mode) for access logs
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);

// Middleware
app.use(morgan('combined', { stream: accessLogStream })); // log to file
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Routes
app.use('/api/auth', authRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('EventEase API is running');
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

