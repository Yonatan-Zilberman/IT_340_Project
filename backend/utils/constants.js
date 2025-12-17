/**
 * Application Constants
 * Centralized constants for status codes, error messages, and configuration
 */

module.exports = {
  // User Roles
  ROLES: {
    USER: 'user',
    ORGANIZER: 'organizer',
    ADMIN: 'admin'
  },

  // Event Status
  EVENT_STATUS: {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Ticket Status
  TICKET_STATUS: {
    AVAILABLE: 'available',
    SOLD: 'sold',
    RESERVED: 'reserved'
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Event Categories
  EVENT_CATEGORIES: {
    CONCERT: 'concert',
    SPORTS: 'sports',
    THEATER: 'theater'
  },

  // Error Messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    USER_NOT_FOUND: 'User not found.',
    EVENT_NOT_FOUND: 'Event not found.',
    TICKET_NOT_FOUND: 'Ticket not found.',
    ORDER_NOT_FOUND: 'Order not found.',
    UNAUTHORIZED: 'Unauthorized access.',
    FORBIDDEN: 'Forbidden. Insufficient permissions.',
    VALIDATION_ERROR: 'Validation error.',
    SERVER_ERROR: 'Server error. Please try again later.'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    USER_REGISTERED: 'User registered successfully.',
    LOGIN_SUCCESS: 'Password correct. 2FA code required.',
    TWO_FA_SUCCESS: '2FA verification successful. Login complete.',
    LOGOUT_SUCCESS: 'Logged out successfully.'
  },

  // OTP Configuration
  OTP_CONFIG: {
    EXPIRY_MINUTES: 5,
    LENGTH: 6,
    MAX_ATTEMPTS: 5,
    RATE_LIMIT_WINDOW: 5 * 60 * 1000, // 5 minutes (reduced from 15)
    MAX_REQUESTS_PER_WINDOW: 10 // Increased from 3 to allow more login attempts
  },

  // JWT Configuration
  JWT_CONFIG: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d'
  }
};

