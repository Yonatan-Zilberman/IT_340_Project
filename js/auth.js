/**
 * Authentication Module
 * Handles login, registration, and 2FA flows
 */

// Get services - will be available after scripts load
function getAuthService() {
  return window.authService;
}

function getUtils() {
  return window.utils;
}

let currentLoginEmailFor2FA = null;

/**
 * Initialize login page
 */
function initializeLoginPage() {
  const loginForm = document.getElementById('loginForm');
  const utils = getUtils();
  
  if (loginForm) {
    if (utils && utils.logFrontendEvent) {
      utils.logFrontendEvent('info', 'Login page initialized');
    }
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
}

/**
 * Handle login form submission (step 1: password check)
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const form = event.target;
  const utils = getUtils();
  const authService = getAuthService();
  
  if (!authService) {
    alert('Authentication service not available. Please refresh the page.');
    return;
  }
  
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    if (utils && utils.logFrontendEvent) {
      utils.logFrontendEvent('warning', 'Login form invalid on submit');
    }
    return;
  }

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe')?.checked;

  if (utils && utils.logFrontendEvent) {
    utils.logFrontendEvent('info', 'Login form submitted', { email, rememberMe });
  }
  
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  if (utils && utils.showLoading) utils.showLoading(submitButton);
  submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
  submitButton.disabled = true;

  // Hide any old 2FA section
  const twoFactorSection = document.getElementById('twoFactorSection');
  if (twoFactorSection) {
    twoFactorSection.style.display = 'none';
  }
  currentLoginEmailFor2FA = null;

  try {
    const data = await authService.login(email, password);

    if (data.twoFactorRequired) {
      currentLoginEmailFor2FA = data.email || email;
      if (utils && utils.logFrontendEvent) {
        utils.logFrontendEvent('info', '2FA required after login', { email: currentLoginEmailFor2FA });
      }

      // Show 2FA section
      const twoFactorSection = document.getElementById('twoFactorSection');
      const twoFactorMessage = document.getElementById('twoFactorMessage');
      const twoFactorCodeInput = document.getElementById('twoFactorCode');

      if (twoFactorSection) {
        twoFactorSection.style.display = 'block';
      }
      
      // Display OTP code prominently if available
      if (data.otpPreview) {
        const otpDisplay = document.getElementById('otpDisplay');
        const otpCode = document.getElementById('otpCode');
        if (otpDisplay && otpCode) {
          otpCode.textContent = data.otpPreview;
          otpDisplay.classList.remove('d-none');
        }
      }
      
      if (twoFactorMessage) {
        twoFactorMessage.textContent = 'Enter the 6-digit code sent to your email.';
        if (data.otpPreview) {
          twoFactorMessage.textContent += ' (Check the code displayed above.)';
        }
      }
      if (twoFactorCodeInput) {
        twoFactorCodeInput.value = '';
        twoFactorCodeInput.focus();
      }

      // Don't show alert if OTP is displayed on screen
      if (!data.otpPreview) {
        alert('Password correct. Please enter your 2FA code.');
      }
    }
  } catch (error) {
    let msg = 'Login failed.';
    if (error.isNetworkError) {
      msg = 'Unable to connect to server. Please make sure the backend is running.';
    } else if (error.data) {
      msg = error.data.error || error.data.message || error.message || 'Invalid email or password.';
    } else if (error.message) {
      msg = error.message;
    }
    alert(msg);
    if (utils && utils.logFrontendEvent) {
      utils.logFrontendEvent('warning', 'Login failed', { email, status: error.status, message: msg });
    }
  } finally {
    if (utils && utils.hideLoading) utils.hideLoading(submitButton);
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

/**
 * Initialize 2FA section (step 2)
 */
function initializeTwoFactorSection() {
  const twoFactorForm = document.getElementById('twoFactorForm');
  const twoFactorSection = document.getElementById('twoFactorSection');
  const utils = getUtils();
  const authService = getAuthService();

  if (twoFactorForm && twoFactorSection) {
    twoFactorForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      event.stopPropagation();

      if (!twoFactorForm.checkValidity()) {
        twoFactorForm.classList.add('was-validated');
        if (utils && utils.logFrontendEvent) {
          utils.logFrontendEvent('warning', '2FA form invalid on submit');
        }
        return;
      }

      if (!currentLoginEmailFor2FA) {
        alert('No login is in progress. Please log in again.');
        if (utils && utils.logFrontendEvent) {
          utils.logFrontendEvent('warning', '2FA submit without login context');
        }
        return;
      }

      const codeInput = document.getElementById('twoFactorCode');
      const code = codeInput ? codeInput.value.trim() : '';

      const button = twoFactorForm.querySelector('button[type="submit"]');
      const originalText = button.innerHTML;
      if (utils && utils.showLoading) utils.showLoading(button);
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verifying...';
      button.disabled = true;

      try {
        await authService.verify2FA(currentLoginEmailFor2FA, code);

        alert('2FA verification successful. You are now logged in.');
        if (utils && utils.logFrontendEvent) {
          utils.logFrontendEvent('info', '2FA verification successful', { email: currentLoginEmailFor2FA });
        }

        currentLoginEmailFor2FA = null;
        window.location.href = 'dashboard.html';
      } catch (error) {
        const msg = error.data?.error || error.data?.message || error.message || '2FA verification failed.';
        alert(msg);
        if (utils && utils.logFrontendEvent) {
          utils.logFrontendEvent('warning', '2FA verification failed', {
            email: currentLoginEmailFor2FA,
            status: error.status,
            message: msg
          });
        }
      } finally {
        if (utils && utils.hideLoading) utils.hideLoading(button);
        button.innerHTML = originalText;
        button.disabled = false;
      }
    });
  }
}

/**
 * Initialize password visibility toggle
 */
function initializePasswordToggle() {
  // Wait a bit for DOM to be fully ready
  setTimeout(() => {
    const toggleButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    console.log('Password toggle init:', { toggleButton: !!toggleButton, passwordInput: !!passwordInput, eyeIcon: !!eyeIcon });
    
    if (toggleButton && passwordInput && eyeIcon) {
      toggleButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const currentType = passwordInput.getAttribute('type') || 'password';
        const newType = currentType === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', newType);
        passwordInput.type = newType; // Also set directly
        
        console.log('Toggling password visibility:', { currentType, newType });
        
        if (newType === 'password') {
          eyeIcon.classList.remove('bi-eye-slash');
          eyeIcon.classList.add('bi-eye');
        } else {
          eyeIcon.classList.remove('bi-eye');
          eyeIcon.classList.add('bi-eye-slash');
        }

        const utils = getUtils();
        if (utils && utils.logFrontendEvent) {
          utils.logFrontendEvent('info', 'Password visibility toggled', { visible: newType === 'text' });
        }
      });
      
      console.log('Password toggle event listener attached');
    } else {
      console.error('Password toggle elements not found:', { toggleButton: !!toggleButton, passwordInput: !!passwordInput, eyeIcon: !!eyeIcon });
    }
  }, 100);
}

// Export functions
window.authModule = {
  initializeLoginPage,
  initializeTwoFactorSection,
  initializePasswordToggle,
};

