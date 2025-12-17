/**
 * EventEase - Main JavaScript File
 * Orchestrates module initialization and page-specific functionality
 */

const utils = window.utils;

// Wait for DOM to be fully loaded AND all scripts to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait for services to be available
  function waitForServices(callback, maxAttempts = 30) {
    let attempts = 0;
    const checkServices = () => {
      attempts++;
      const hasServices = window.CONFIG && window.apiService && window.authService && window.eventService && window.utils;
      
      if (hasServices || attempts >= maxAttempts) {
        if (!hasServices) {
          console.warn('Some services not available after waiting:', {
            CONFIG: !!window.CONFIG,
            apiService: !!window.apiService,
            authService: !!window.authService,
            eventService: !!window.eventService,
            utils: !!window.utils
          });
          console.warn('Available window properties:', Object.keys(window).filter(k => k.includes('Service') || k === 'CONFIG' || k === 'utils'));
        } else {
          console.log('All services available!');
        }
        callback();
      } else {
        setTimeout(checkServices, 50);
      }
    };
    checkServices();
  }
  
  waitForServices(() => {
    // Update navigation bar based on auth state
    const utils = window.utils;
    if (utils && utils.updateNavigation) {
      utils.updateNavigation();
    }
    
    // Log page load
    if (utils && utils.logFrontendEvent) {
      utils.logFrontendEvent('info', 'Page loaded', {
        path: window.location.pathname,
        hasLoginForm: !!document.getElementById('loginForm')
      });
    }

    // Initialize based on current page
    const path = window.location.pathname;
    
    if (path.includes('login.html')) {
      initializeLoginPage();
    } else if (path.includes('index.html') || path === '/') {
      initializeHomePage();
    } else if (path.includes('dashboard.html')) {
      initializeDashboard();
    }

    // Initialize common functionality
    initializeFormValidation();
    initializeSmoothScroll();
    initializePresaleCode();
  });
});

/**
 * Initialize login page
 */
function initializeLoginPage() {
  const authModule = window.authModule;
  if (authModule) {
    authModule.initializeLoginPage();
    authModule.initializeTwoFactorSection();
    authModule.initializePasswordToggle();
  }
  
  // Initialize registration button
  initializeRegistration();
}

/**
 * Initialize homepage
 */
function initializeHomePage() {
  const eventsModule = window.eventsModule;
  if (eventsModule && eventsModule.loadEvents) {
    eventsModule.loadEvents();
  } else {
    console.error('EventsModule not available');
    const container = document.getElementById('eventsContainer');
    if (container) {
      container.innerHTML = '<p class="text-danger text-center">Service initialization error. Please refresh the page.</p>';
    }
  }
}

/**
 * Initialize dashboard
 */
function initializeDashboard() {
  // Check authentication
  if (!utils.requireAuth()) {
    return;
  }

  // Load user data
  loadDashboardData();
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
  const authService = window.authService;
  const user = authService.getUser();
  
  if (user) {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }
  }
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
  const forms = document.querySelectorAll('.needs-validation, #loginForm, #twoFactorForm');
  
  forms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        utils.logFrontendEvent('warning', 'Form submission blocked due to validation failure');
      }
      
      form.classList.add('was-validated');
    }, false);
  });
}

/**
 * Smooth scroll for anchor links
 */
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          utils.logFrontendEvent('info', 'Smooth scroll link clicked', { href });
        }
      }
    });
  });
}

/**
 * Handle presale code application
 */
function initializePresaleCode() {
  const presaleCodeButton = document.querySelector('#presaleCode')?.parentElement?.querySelector('button');
  
  if (presaleCodeButton) {
    utils.logFrontendEvent('info', 'Presale section initialized');
    presaleCodeButton.addEventListener('click', handlePresaleCode);
  }
  
  const presaleCodeInput = document.getElementById('presaleCode');
  if (presaleCodeInput) {
    presaleCodeInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        handlePresaleCode();
      }
    });
  }
}

/**
 * Handle presale code
 */
function handlePresaleCode() {
  const presaleCodeInput = document.getElementById('presaleCode');
  
  if (presaleCodeInput) {
    const code = presaleCodeInput.value.trim();
    
    if (code) {
      // Presale code validation will be implemented in future milestones
      alert('Presale code functionality will be implemented in future milestones.\n\nCode: ' + code);
      utils.logFrontendEvent('info', 'Presale code entered', { code });
    } else {
      alert('Please enter a presale code.');
      utils.logFrontendEvent('warning', 'Presale code submit with empty value');
    }
  }
}

/**
 * Add animation on scroll (optional enhancement)
 */
function animateOnScroll() {
  const elements = document.querySelectorAll('.feature-card, .event-card');
  
  if (!('IntersectionObserver' in window)) {
    return;
  }
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });
  
  elements.forEach(function(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
  });
}

// Initialize scroll animations if supported
if ('IntersectionObserver' in window) {
  document.addEventListener('DOMContentLoaded', animateOnScroll);
}

/**
 * Initialize registration functionality
 */
function initializeRegistration() {
  // Wait for DOM to be ready
  setTimeout(() => {
    // Find all "Create Account" buttons/links
    const createAccountLinks = document.querySelectorAll('a.btn-outline-primary, a[href="#"]');
    
    console.log('Registration init - found links:', createAccountLinks.length);
    
    createAccountLinks.forEach(link => {
      const text = link.textContent || link.innerText || '';
      console.log('Checking link:', text);
      if (text.includes('Create Account') || text.includes('Get Started')) {
        console.log('Attaching click handler to:', text);
        link.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Create Account clicked');
          showRegistrationModal();
        });
      }
    });
    
    // Also check for specific ID
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
      console.log('Found getStartedBtn');
      getStartedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showRegistrationModal();
      });
    }
  }, 100);
}

/**
 * Show registration modal
 */
function showRegistrationModal() {
  // Check if modal already exists
  let modal = document.getElementById('registrationModal');
  
  if (!modal) {
    // Create modal
    modal = document.createElement('div');
    modal.id = 'registrationModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Account</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="registrationForm" novalidate>
              <div class="mb-3">
                <label for="regName" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="regName" required>
                <div class="invalid-feedback">Please enter your name.</div>
              </div>
              <div class="mb-3">
                <label for="regEmail" class="form-label">Email Address</label>
                <input type="email" class="form-control" id="regEmail" required>
                <div class="invalid-feedback">Please enter a valid email address.</div>
              </div>
              <div class="mb-3">
                <label for="regPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="regPassword" required minlength="6">
                <div class="invalid-feedback">Password must be at least 6 characters.</div>
              </div>
              <div id="registrationError" class="alert alert-danger d-none"></div>
              <div id="registrationSuccess" class="alert alert-success d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="submitRegistration">Create Account</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Initialize Bootstrap modal
    const bsModal = new bootstrap.Modal(modal);
    
    // Handle form submission
    const submitBtn = modal.querySelector('#submitRegistration');
    submitBtn.addEventListener('click', async function() {
      const form = modal.querySelector('#registrationForm');
      const nameInput = modal.querySelector('#regName');
      const emailInput = modal.querySelector('#regEmail');
      const passwordInput = modal.querySelector('#regPassword');
      const errorDiv = modal.querySelector('#registrationError');
      const successDiv = modal.querySelector('#registrationSuccess');
      
      // Clear previous messages
      errorDiv.classList.add('d-none');
      successDiv.classList.add('d-none');
      
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      // Disable button
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
      
      try {
        // Wait for authService to be available
        let authService = window.authService;
        let attempts = 0;
        while (!authService && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          authService = window.authService;
          attempts++;
        }
        
        if (!authService) {
          throw new Error('Authentication service not available. Please refresh the page.');
        }
        
        await authService.register({ name, email, password });
        
        // Show success
        successDiv.textContent = 'Account created successfully! You can now log in.';
        successDiv.classList.remove('d-none');
        
        // Clear form
        form.reset();
        form.classList.remove('was-validated');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          bsModal.hide();
          // Redirect to login or pre-fill email
          const loginEmail = document.getElementById('email');
          if (loginEmail) {
            loginEmail.value = email;
          }
        }, 2000);
        
      } catch (error) {
        let errorMsg = 'Registration failed. Please try again.';
        if (error.isNetworkError) {
          errorMsg = 'Unable to connect to server. Please make sure the backend is running.';
        } else if (error.data) {
          errorMsg = error.data.error || error.data.message || error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        errorDiv.textContent = errorMsg;
        errorDiv.classList.remove('d-none');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
      }
    });
    
    // Show modal
    bsModal.show();
  } else {
    // Modal exists, just show it
    const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
    bsModal.show();
  }
}
