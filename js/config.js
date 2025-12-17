/**
 * Frontend Configuration
 * Centralized configuration for API endpoints and app settings
 */

const CONFIG = {
  // API Base URL - can be overridden by environment
  // Handle both IPv4 and IPv6 localhost
  // Note: Using port 5001 to avoid conflict with AirPlay on macOS port 5000
  // Prefer IPv4 (127.0.0.1) for better compatibility
  API_BASE_URL: (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      // Always use 127.0.0.1 for localhost to avoid IPv6 connection issues
      return `${window.location.protocol}//127.0.0.1:5001`;
    }
    return window.location.origin.replace(/:\d+$/, ':5001');
  })(),
  
  // API Endpoints
  API_ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      VERIFY_2FA: '/api/auth/verify-2fa',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
    EVENTS: {
      LIST: '/api/events',
      DETAIL: (id) => `/api/events/${id}`,
    },
    TICKETS: {
      LIST: '/api/tickets',
      DETAIL: (id) => `/api/tickets/${id}`,
      PURCHASE: (id) => `/api/tickets/${id}/purchase`,
    },
    ORDERS: {
      LIST: '/api/orders',
      DETAIL: (id) => `/api/orders/${id}`,
    },
    USERS: {
      PROFILE: '/api/users/profile',
      LISTINGS: (id) => `/api/users/${id}/listings`,
    },
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'eventease_access_token',
    REFRESH_TOKEN: 'eventease_refresh_token',
    USER: 'eventease_user',
  },
};

// Make config available globally
window.CONFIG = CONFIG;

// Log when CONFIG is ready
console.log('CONFIG initialized:', !!window.CONFIG, 'API_BASE_URL:', CONFIG.API_BASE_URL);

