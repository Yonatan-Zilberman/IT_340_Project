const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Import configuration
const { validateEnv } = require('./config/env');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const frontendLogRoutes = require('./routes/frontendLog');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Validate environment variables
validateEnv();

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream (in append mode) for access logs
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);

// Middleware
app.use(morgan('combined', { stream: accessLogStream })); // log all requests

// CORS configuration - allow requests from localhost (both IPv4 and IPv6)
// In development, allow all origins for easier testing
const corsOptions = process.env.NODE_ENV === 'production' 
  ? {
      origin: [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://[::1]:8000',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://[::1]:3000'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  : {
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// API Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EventEase API is running',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/log/frontend', frontendLogRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
// Note: Using 5001 instead of 5000 to avoid conflict with AirPlay on macOS
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access at: http://localhost:${PORT} or http://127.0.0.1:${PORT} or http://[::1]:${PORT}`);
});
