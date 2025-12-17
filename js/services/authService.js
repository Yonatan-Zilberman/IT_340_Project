/**
 * Authentication Service
 * Handles authentication-related API calls
 */

// Wait for CONFIG and apiService to be available
function getConfig() {
  return window.CONFIG || {};
}

function getApiService() {
  if (!window.apiService) {
    console.error('apiService not available in getApiService');
    throw new Error('API service not available. Please refresh the page.');
  }
  return window.apiService;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    return apiService.post(CONFIG.API_ENDPOINTS?.AUTH?.REGISTER || '/api/auth/register', userData, false);
  }

  /**
   * Login (step 1: password verification)
   */
  async login(email, password) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    return apiService.post(CONFIG.API_ENDPOINTS?.AUTH?.LOGIN || '/api/auth/login', { email, password }, false);
  }

  /**
   * Verify 2FA code (step 2: OTP verification)
   */
  async verify2FA(email, code) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const response = await apiService.post(
      CONFIG.API_ENDPOINTS?.AUTH?.VERIFY_2FA || '/api/auth/verify-2fa',
      { email, code },
      false
    );

    // Store tokens and user data
    if (response.token) {
      localStorage.setItem(CONFIG.STORAGE_KEYS?.ACCESS_TOKEN || 'eventease_access_token', response.token);
    }
    if (response.refreshToken) {
      localStorage.setItem(CONFIG.STORAGE_KEYS?.REFRESH_TOKEN || 'eventease_refresh_token', response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem(CONFIG.STORAGE_KEYS?.USER || 'eventease_user', JSON.stringify(response.user));
    }

    return response;
  }

  /**
   * Logout
   */
  async logout() {
    const apiService = getApiService();
    const CONFIG = getConfig();
    
    try {
      if (apiService) {
        await apiService.post(CONFIG.API_ENDPOINTS?.AUTH?.LOGOUT || '/api/auth/logout');
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(CONFIG.STORAGE_KEYS?.ACCESS_TOKEN || 'eventease_access_token');
      localStorage.removeItem(CONFIG.STORAGE_KEYS?.REFRESH_TOKEN || 'eventease_refresh_token');
      localStorage.removeItem(CONFIG.STORAGE_KEYS?.USER || 'eventease_user');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    return apiService.get(CONFIG.API_ENDPOINTS?.AUTH?.ME || '/api/auth/me');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Get stored token
   */
  getToken() {
    const CONFIG = getConfig();
    return localStorage.getItem(CONFIG.STORAGE_KEYS?.ACCESS_TOKEN || 'eventease_access_token');
  }

  /**
   * Get stored user data
   */
  getUser() {
    const CONFIG = getConfig();
    const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS?.USER || 'eventease_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Export singleton instance
let authService;
try {
  authService = new AuthService();
} catch (e) {
  console.error('Error creating authService:', e);
  authService = new AuthService();
}
window.authService = authService;

// Log when authService is ready
console.log('authService initialized:', !!window.authService);

