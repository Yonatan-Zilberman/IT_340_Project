/**
 * API Service
 * Base service for making HTTP requests to the backend
 */

// Get CONFIG dynamically
function getConfig() {
  if (!window.CONFIG) {
    console.warn('CONFIG not available, using defaults');
    return { 
      API_BASE_URL: 'http://127.0.0.1:5001',
      STORAGE_KEYS: {
        ACCESS_TOKEN: 'eventease_access_token',
        REFRESH_TOKEN: 'eventease_refresh_token',
        USER: 'eventease_user',
      }
    };
  }
  return window.CONFIG;
}

class ApiService {
  constructor() {
    // Will be set when CONFIG is available
    this.baseURL = null;
    console.log('ApiService constructor called');
  }
  
  getBaseURL() {
    if (!this.baseURL) {
      const CONFIG = getConfig();
      this.baseURL = CONFIG.API_BASE_URL || 'http://127.0.0.1:5001';
      console.log('ApiService baseURL set to:', this.baseURL);
    }
    return this.baseURL;
  }

  /**
   * Get authentication token from localStorage
   */
  getToken() {
    const CONFIG = getConfig();
    return localStorage.getItem(CONFIG.STORAGE_KEYS?.ACCESS_TOKEN || 'eventease_access_token');
  }

  /**
   * Build full URL
   */
  buildURL(endpoint) {
    return `${this.getBaseURL()}${endpoint}`;
  }

  /**
   * Get default headers
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle response
   */
  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || data.message || 'Request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * GET request
   */
  async get(endpoint, includeAuth = true) {
    try {
      const response = await fetch(this.buildURL(endpoint), {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
      });

      return this.handleResponse(response);
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        const networkError = new Error('Unable to connect to server. Please make sure the backend is running.');
        networkError.status = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data, includeAuth = true) {
    try {
      const response = await fetch(this.buildURL(endpoint), {
        method: 'POST',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      return this.handleResponse(response);
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        const networkError = new Error('Unable to connect to server. Please make sure the backend is running.');
        networkError.status = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, data, includeAuth = true) {
    const response = await fetch(this.buildURL(endpoint), {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, includeAuth = true) {
    const response = await fetch(this.buildURL(endpoint), {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse(response);
  }
}

// Export singleton instance - ensure it's created even if CONFIG isn't ready
let apiService;
try {
  apiService = new ApiService();
} catch (e) {
  console.error('Error creating apiService:', e);
  // Create with fallback
  apiService = new ApiService();
  apiService.baseURL = 'http://127.0.0.1:5001';
}
window.apiService = apiService;

// Log when apiService is ready
console.log('apiService initialized:', !!window.apiService);

