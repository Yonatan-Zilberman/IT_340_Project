/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Frontend logging helper
 * Sends logs to the backend logging endpoint
 */
function logFrontendEvent(level, message, context = {}) {
  try {
    const apiService = window.apiService;
    if (!apiService) return;

    apiService.post('/api/log/frontend', {
      level: level || 'info',
      message: message || '',
      context: {
        url: window.location.href,
        path: window.location.pathname,
        ...context
      }
    }).catch(function (err) {
      console.error('Frontend log failed:', err);
    });
  } catch (err) {
    console.error('Frontend log error:', err);
  }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for display
 */
function formatTime(timeString) {
  if (!timeString) return '';
  // If time is in HH:MM format, convert to 12-hour format
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Show loading state
 */
function showLoading(element) {
  if (element) {
    element.classList.add('loading');
    if (element.disabled !== undefined) {
      element.disabled = true;
    }
  }
}

/**
 * Hide loading state
 */
function hideLoading(element) {
  if (element) {
    element.classList.remove('loading');
    if (element.disabled !== undefined) {
      element.disabled = false;
    }
  }
}

/**
 * Show error message
 */
function showError(message, container) {
  if (!container) return;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger alert-dismissible fade show';
  errorDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  container.insertBefore(errorDiv, container.firstChild);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message, container) {
  if (!container) return;
  
  const successDiv = document.createElement('div');
  successDiv.className = 'alert alert-success alert-dismissible fade show';
  successDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  container.insertBefore(successDiv, container.firstChild);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const authService = window.authService;
  return authService ? authService.isAuthenticated() : false;
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Update navigation bar based on authentication state
 * Call this on every page load to show correct nav items
 * Standard order: Home, About, Browse Events, Dashboard (if logged in), Login/Logout
 */
function updateNavigation() {
  const authService = window.authService;
  if (!authService) {
    // If authService isn't loaded yet, try again after a short delay
    setTimeout(updateNavigation, 100);
    return;
  }

  const isAuth = authService.isAuthenticated();
  const user = authService.getUser();
  
  // Find all navigation bars on the page
  const navBars = document.querySelectorAll('#navbarNav ul.navbar-nav');
  
  navBars.forEach(nav => {
    // Clear all existing nav items except the structure
    const existingItems = Array.from(nav.querySelectorAll('.nav-item'));
    
    // Remove all items
    existingItems.forEach(item => item.remove());
    
    // Get current page to set active class
    const currentPath = window.location.pathname;
    const isHomePage = currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/');
    const isAboutPage = currentPath.includes('#about');
    const isEventsPage = currentPath.includes('events.html');
    const isDashboardPage = currentPath.includes('dashboard.html');
    const isLoginPage = currentPath.includes('login.html');
    
    // Build navigation in standard order
    const navItems = [];
    
    // 1. Home
    navItems.push(`
      <li class="nav-item">
        <a class="nav-link${isHomePage ? ' active' : ''}" href="index.html">Home</a>
      </li>
    `);
    
    // 2. About
    navItems.push(`
      <li class="nav-item">
        <a class="nav-link${isAboutPage ? ' active' : ''}" href="index.html#about">About</a>
      </li>
    `);
    
    // 3. Browse Events
    navItems.push(`
      <li class="nav-item">
        <a class="nav-link${isEventsPage ? ' active' : ''}" href="events.html">Browse Events</a>
      </li>
    `);
    
    // 4. Dashboard (if logged in)
    if (isAuth && user) {
      navItems.push(`
        <li class="nav-item auth-nav">
          <a class="nav-link${isDashboardPage ? ' active' : ''}" href="dashboard.html">
            <i class="bi bi-person-circle"></i> Dashboard
          </a>
        </li>
      `);
    }
    
    // 5. Login/Logout
    if (isAuth && user) {
      navItems.push(`
        <li class="nav-item logout-nav">
          <a class="nav-link" href="#" id="logoutLink" style="cursor: pointer;">
            <i class="bi bi-box-arrow-right"></i> Logout
          </a>
        </li>
      `);
    } else {
      navItems.push(`
        <li class="nav-item auth-nav">
          <a class="nav-link${isLoginPage ? ' active' : ''}" href="login.html">
            <i class="bi bi-box-arrow-in-right"></i> Login
          </a>
        </li>
      `);
    }
    
    // Insert all items
    nav.innerHTML = navItems.join('');
    
    // Add logout handler if logged in
    if (isAuth && user) {
      const logoutLink = document.getElementById('logoutLink');
      if (logoutLink && !logoutLink.hasAttribute('data-handler-attached')) {
        logoutLink.setAttribute('data-handler-attached', 'true');
        logoutLink.addEventListener('click', async (e) => {
          e.preventDefault();
          await authService.logout();
          window.location.href = 'index.html';
        });
      }
      
      // Also handle existing logout button on dashboard if it exists
      const existingLogoutBtn = document.getElementById('logoutBtnNav');
      if (existingLogoutBtn) {
        // Remove the button and replace with nav-link (already done above)
        existingLogoutBtn.remove();
      }
    }
  });
}

// Export functions
window.utils = {
  logFrontendEvent,
  formatDate,
  formatTime,
  formatCurrency,
  showLoading,
  hideLoading,
  showError,
  showSuccess,
  isAuthenticated,
  requireAuth,
  updateNavigation,
};

// Log when utils is ready
console.log('utils initialized:', !!window.utils);

