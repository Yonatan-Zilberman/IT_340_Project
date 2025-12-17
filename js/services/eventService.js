/**
 * Event Service
 * Handles event-related API calls
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

class EventService {
  /**
   * Get all events with optional filters
   */
  async getEvents(filters = {}) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sort) params.append('sort', filters.sort);

    const queryString = params.toString();
    const endpoint = CONFIG.API_ENDPOINTS?.EVENTS?.LIST || '/api/events';
    return apiService.get(queryString ? `${endpoint}?${queryString}` : endpoint);
  }

  /**
   * Get single event by ID
   */
  async getEvent(id) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const endpoint = CONFIG.API_ENDPOINTS?.EVENTS?.DETAIL 
      ? CONFIG.API_ENDPOINTS.EVENTS.DETAIL(id)
      : `/api/events/${id}`;
    return apiService.get(endpoint);
  }

  /**
   * Create new event (organizer/admin only)
   */
  async createEvent(eventData) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    return apiService.post(CONFIG.API_ENDPOINTS?.EVENTS?.LIST || '/api/events', eventData);
  }

  /**
   * Update event (organizer/admin only)
   */
  async updateEvent(id, eventData) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const endpoint = CONFIG.API_ENDPOINTS?.EVENTS?.DETAIL 
      ? CONFIG.API_ENDPOINTS.EVENTS.DETAIL(id)
      : `/api/events/${id}`;
    return apiService.put(endpoint, eventData);
  }

  /**
   * Delete event (organizer/admin only)
   */
  async deleteEvent(id) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const endpoint = CONFIG.API_ENDPOINTS?.EVENTS?.DETAIL 
      ? CONFIG.API_ENDPOINTS.EVENTS.DETAIL(id)
      : `/api/events/${id}`;
    return apiService.delete(endpoint);
  }
}

// Export singleton instance
let eventService;
try {
  eventService = new EventService();
} catch (e) {
  console.error('Error creating eventService:', e);
  eventService = new EventService();
}
window.eventService = eventService;

// Log when eventService is ready
console.log('eventService initialized:', !!window.eventService);

