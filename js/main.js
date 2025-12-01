/**
 * EventEase - Main JavaScript File
 * Handles form validation, interactivity, and user interactions
 */

const API_BASE_URL = document.body?.dataset?.apiBase || 'http://localhost:3000/api';
const DASHBOARD_REDIRECT = 'index.html';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
    initializeRegisterPage();
    initializePasswordToggle();
    initializeFormValidation();
    initializePresaleCode();
    initializeSmoothScroll();
    initializeForgotPassword();
    initializePasswordStrength(); // <-- added for password meter
    
    // Initialize scroll animations if supported
    if ('IntersectionObserver' in window) {
        animateOnScroll();
    }
});

/**
 * Initialize login page specific functionality
 */
function initializeLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

/**
 * Initialize registration form functionality
 */
function initializeRegisterPage() {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const payload = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
    };

    const submitButton = form.querySelector('button[type="submit"]');
    const resetLoading = setLoadingState(submitButton, 'Signing in...');

    try {
        const data = await sendAuthRequest('/auth/login', payload);
        handleAuthSuccess(data, 'Welcome back! Redirecting you now...');
        form.reset();
        form.classList.remove('was-validated');

        setTimeout(() => {
            window.location.href = DASHBOARD_REDIRECT;
        }, 1200);
    } catch (error) {
        handleAuthError(error);
    } finally {
        resetLoading();
    }
}

/**
 * Handle register form submission
 */
async function handleRegisterSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const payload = {
        name: document.getElementById('registerName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value,
    };

    const submitButton = form.querySelector('button[type="submit"]');
    const resetLoading = setLoadingState(submitButton, 'Creating account...');

    try {
        const data = await sendAuthRequest('/auth/register', payload);
        handleAuthSuccess(data, 'Account created! You are now signed in.');
        form.reset();
        form.classList.remove('was-validated');

        setTimeout(() => {
            window.location.href = DASHBOARD_REDIRECT;
        }, 1200);
    } catch (error) {
        handleAuthError(error);
    } finally {
        resetLoading();
    }
}

/**
 * Send POST request to authentication endpoint
 */
async function sendAuthRequest(endpoint, payload) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    let data;
    try {
        data = await response.json();
    } catch (err) {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.message || 'Authentication failed.');
    }

    return data;
}

/**
 * Display success messages and persist token/user details
 */
function handleAuthSuccess(data, message) {
    if (data?.token) {
        localStorage.setItem('eventease_token', data.token);
    }

    if (data?.user) {
        localStorage.setItem('eventease_user', JSON.stringify(data.user));
    }

    renderAlert('success', message || data?.message || 'Success!');
}

/**
 * Surface auth errors to the user
 */
function handleAuthError(error) {
    const message = error?.message || 'Something went wrong. Please try again.';
    renderAlert('danger', message);
}

/**
 * Toggle button loading state and return cleanup fn
 */
function setLoadingState(button, loadingText) {
    if (!button) {
        return () => {};
    }

    const originalHtml = button.innerHTML;
    const originalDisabled = button.disabled;

    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${loadingText}`;
    button.disabled = true;

    return () => {
        button.innerHTML = originalHtml;
        button.disabled = originalDisabled;
    };
}

/**
 * Render bootstrap alerts inside login card
 */
function renderAlert(type, message) {
    const container = document.getElementById('authAlertContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

/**
 * Initialize password visibility toggle
 */
function initializePasswordToggle() {
    const toggleButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (toggleButton && passwordInput && eyeIcon) {
        toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            if (type === 'password') {
                eyeIcon.classList.remove('bi-eye-slash');
                eyeIcon.classList.add('bi-eye');
            } else {
                eyeIcon.classList.remove('bi-eye');
                eyeIcon.classList.add('bi-eye-slash');
            }
        });
    }
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

/**
 * Initialize presale code functionality
 */
function initializePresaleCode() {
    const presaleCodeButton = document.querySelector('#presaleCode')?.parentElement?.querySelector('button');
    const presaleCodeInput = document.getElementById('presaleCode');
    
    if (presaleCodeButton && presaleCodeInput) {
        presaleCodeButton.addEventListener('click', handlePresaleCode);
        
        presaleCodeInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handlePresaleCode();
            }
        });
    }
}

/**
 * Handle presale code application
 */
function handlePresaleCode() {
    const presaleCodeInput = document.getElementById('presaleCode');
    
    if (!presaleCodeInput) return;
    
    const code = presaleCodeInput.value.trim();
    
    if (!code) {
        renderAlert('warning', 'Please enter a presale code.');
        return;
    }
    
    // Presale code validation will be implemented in future milestones
    renderAlert('info', 'Presale code functionality will be implemented in future milestones. Code: ' + code);
}

/**
 * Initialize forgot password link
 */
function initializeForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            renderAlert('info', 'Password reset functionality will be available in a future update.');
        });
    }
}

/**
 * Initialize smooth scroll for anchor links
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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
                }
            }
        });
    });
}

/**
 * Add animation on scroll (optional enhancement)
 */
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .event-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}
/**
 * Initialize enhanced password strength meter for registration
 */
function initializePasswordStrength() {
    const passwordInput = document.getElementById('registerPassword');
    const strengthDisplay = document.getElementById('password-strength');

    if (!passwordInput || !strengthDisplay) return;

    passwordInput.addEventListener('input', () => {
        const value = passwordInput.value;
        let strengthScore = 0;

        // Criteria checks
        if (value.length >= 8) strengthScore++;          // Minimum length
        if (/[A-Z]/.test(value)) strengthScore++;        // Uppercase
        if (/[a-z]/.test(value)) strengthScore++;        // Lowercase
        if (/[0-9]/.test(value)) strengthScore++;        // Number
        if (/[\W_]/.test(value)) strengthScore++;        // Special character

        // Map score to strength label and color
        let strengthText = '';
        let color = '';

        switch (strengthScore) {
            case 0:
            case 1:
                strengthText = 'Very Weak';
                color = 'red';
                break;
            case 2:
                strengthText = 'Weak';
                color = 'orange';
                break;
            case 3:
                strengthText = 'Moderate';
                color = 'goldenrod';
                break;
            case 4:
                strengthText = 'Strong';
                color = 'green';
                break;
            case 5:
                strengthText = 'Very Strong';
                color = 'darkgreen';
                break;
        }

        strengthDisplay.textContent = 'Password strength: ' + strengthText;
        strengthDisplay.style.color = color;
    });
}
