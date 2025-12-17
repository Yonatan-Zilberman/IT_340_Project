/**
 * Ticket Service
 * Handles ticket-related API calls
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

class TicketService {
  /**
   * Get all tickets with optional filters
   */
  async getTickets(filters = {}) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const params = new URLSearchParams();
    if (filters.eventId) params.append('eventId', filters.eventId);
    if (filters.status) params.append('status', filters.status);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = CONFIG.API_ENDPOINTS?.TICKETS?.LIST || '/api/tickets';
    return apiService.get(queryString ? `${endpoint}?${queryString}` : endpoint);
  }

  /**
   * Get single ticket by ID
   */
  async getTicket(id) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const endpoint = CONFIG.API_ENDPOINTS?.TICKETS?.DETAIL 
      ? CONFIG.API_ENDPOINTS.TICKETS.DETAIL(id)
      : `/api/tickets/${id}`;
    return apiService.get(endpoint);
  }

  /**
   * Create new ticket listing
   */
  async createTicket(ticketData) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    return apiService.post(CONFIG.API_ENDPOINTS?.TICKETS?.LIST || '/api/tickets', ticketData);
  }

  /**
   * Update ticket listing
   */
  async updateTicket(id, ticketData) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const endpoint = CONFIG.API_ENDPOINTS?.TICKETS?.DETAIL 
      ? CONFIG.API_ENDPOINTS.TICKETS.DETAIL(id)
      : `/api/tickets/${id}`;
    return apiService.put(endpoint, ticketData);
  }

  /**
   * Delete ticket listing
   */
  async deleteTicket(id) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const endpoint = CONFIG.API_ENDPOINTS?.TICKETS?.DETAIL 
      ? CONFIG.API_ENDPOINTS.TICKETS.DETAIL(id)
      : `/api/tickets/${id}`;
    return apiService.delete(endpoint);
  }

  /**
   * Purchase ticket
   */
  async purchaseTicket(id) {
    const apiService = getApiService();
    const CONFIG = getConfig();
    if (!apiService) throw new Error('API service not available');
    
    const endpoint = CONFIG.API_ENDPOINTS?.TICKETS?.PURCHASE 
      ? CONFIG.API_ENDPOINTS.TICKETS.PURCHASE(id)
      : `/api/tickets/${id}/purchase`;
    return apiService.post(endpoint, {});
  }
}

// Export singleton instance
let ticketService;
try {
  ticketService = new TicketService();
} catch (e) {
  console.error('Error creating ticketService:', e);
  ticketService = new TicketService();
}
window.ticketService = ticketService;

// Log when ticketService is ready
console.log('ticketService initialized:', !!window.ticketService);

