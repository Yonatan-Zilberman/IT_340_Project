/**
 * Events Module
 * Handles event display and interactions
 */

// Get services - will be available after scripts load
function getEventService() {
  return window.eventService;
}

function getUtils() {
  return window.utils;
}

/**
 * Load and display events on the homepage
 */
async function loadEvents() {
  const eventsContainer = document.getElementById('eventsContainer');
  if (!eventsContainer) return;

  // Wait for services to be available
  let eventService = getEventService();
  let utils = getUtils();
  let attempts = 0;
  
  while ((!eventService || !utils) && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 50));
    eventService = getEventService();
    utils = getUtils();
    attempts++;
  }
  
  if (!eventService) {
    console.error('EventService not available after waiting');
    eventsContainer.innerHTML = '<p class="text-danger text-center">Service initialization error. Please refresh the page.</p>';
    return;
  }
  
  if (!utils) {
    console.error('Utils not available after waiting');
    eventsContainer.innerHTML = '<p class="text-danger text-center">Utils not available. Please refresh the page.</p>';
    return;
  }

  try {
    if (utils.showLoading) utils.showLoading(eventsContainer);
    const response = await eventService.getEvents({ limit: 6 });
    
    if (response.success && response.data && response.data.length > 0) {
      displayEvents(response.data, eventsContainer, utils);
    } else {
      eventsContainer.innerHTML = '<p class="text-muted text-center">No events available at this time.</p>';
    }
  } catch (error) {
    console.error('Error loading events:', error);
    let errorMessage = 'Error loading events. Please try again later.';
    if (error.isNetworkError) {
      errorMessage = 'Unable to connect to server. Please make sure the backend is running on port 5001.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    eventsContainer.innerHTML = `<p class="text-danger text-center">${errorMessage}</p>`;
  } finally {
    if (utils && utils.hideLoading) utils.hideLoading(eventsContainer);
  }
}

/**
 * Display events in a container
 */
function displayEvents(events, container, utils) {
  if (!container || !events || events.length === 0) return;
  if (!utils) utils = getUtils();

  const eventsHTML = events.map(event => {
    const eventDate = utils && utils.formatDate ? utils.formatDate(event.date) : new Date(event.date).toLocaleDateString();
    const eventTime = utils && utils.formatTime ? utils.formatTime(event.time) : event.time;
    const categoryIcon = getCategoryIcon(event.category);
    
    return `
      <div class="col-md-4 mb-4">
        <div class="card event-card h-100">
          <div class="card-body">
            <div class="text-center mb-3">
              <i class="bi ${categoryIcon} event-icon"></i>
            </div>
            <h5 class="card-title">${escapeHtml(event.name)}</h5>
            <p class="card-text text-muted small">
              <i class="bi bi-calendar"></i> ${eventDate}<br>
              <i class="bi bi-clock"></i> ${eventTime}<br>
              <i class="bi bi-geo-alt"></i> ${escapeHtml(event.venue)}
            </p>
            <a href="event-detail.html?id=${event._id}" class="btn btn-primary btn-sm">
              View Details
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="row g-4">
      ${eventsHTML}
    </div>
  `;
}

/**
 * Get icon for event category
 */
function getCategoryIcon(category) {
  const icons = {
    concert: 'bi-music-note-beamed',
    sports: 'bi-trophy',
    theater: 'bi-camera-reels',
  };
  return icons[category] || 'bi-ticket-perforated';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export functions
window.eventsModule = {
  loadEvents,
  displayEvents,
};

