/**
 * EventEase - Main JavaScript File
 * Handles form validation, interactivity, and user interactions
 */

const API_BASE_URL = 'http://localhost:5000';
let currentLoginEmailFor2FA = null;

/**
 * Frontend logging helper
 * Sends logs to the backend logging endpoint
 */
function logFrontendEvent(level, message, context = {}) {
    try {
        fetch(`${API_BASE_URL}/api/log/frontend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                level: level || 'info',
                message: message || '',
                context: {
                    url: window.location.href,
                    path: window.location.pathname,
                    ...context
                }
            })
        }).catch(function (err) {
            console.error('Frontend log failed:', err);
        });
    } catch (err) {
        console.error('Frontend log error:', err);
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Log page load
    logFrontendEvent('info', 'Page loaded', {
        hasLoginForm: !!document.getElementById('loginForm')
    });

    initializeLoginPage();
    initializeTwoFactorSection();
    initializePasswordToggle();
    initializeFormValidation();
});

/**
 * Initialize login page specific functionality
 */
function initializeLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        logFrontendEvent('info', 'Login page initialized');
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

/**
 * Handle login form submission (step 1: password check)
 */
function handleLoginSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target;
    
    // Check if form is valid
    if (form.checkValidity()) {
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Log login attempt (do NOT log password)
        logFrontendEvent('info', 'Login form submitted', {
            email: email,
            rememberMe: rememberMe
        });
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
        submitButton.disabled = true;

        // Hide any old 2FA section content
        const twoFactorSection = document.getElementById('twoFactorSection');
        if (twoFactorSection) {
            twoFactorSection.style.display = 'none';
        }
        currentLoginEmailFor2FA = null;

        // Call backend /login to check password and trigger 2FA
        fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(async function(response) {
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                // Login failed
                const msg = data.message || 'Login failed.';
                alert(msg);
                logFrontendEvent('warning', 'Login failed', {
                    email: email,
                    status: response.status,
                    message: msg
                });

                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                return;
            }

            // If backend says 2FA required
            if (data.twoFactorRequired) {
                currentLoginEmailFor2FA = data.email || email;

                logFrontendEvent('info', '2FA required after login', {
                    email: currentLoginEmailFor2FA
                });

                // Show 2FA section
                const twoFactorSection = document.getElementById('twoFactorSection');
                const twoFactorMessage = document.getElementById('twoFactorMessage');
                const twoFactorCodeInput = document.getElementById('twoFactorCode');

                if (twoFactorSection) {
                    twoFactorSection.style.display = 'block';
                }
                if (twoFactorMessage) {
                    // For demo: show OTP in message so professor can see it
                    const otpText = data.otpPreview ? ` (Demo code: ${data.otpPreview})` : '';
                    twoFactorMessage.textContent = 'Enter the 6-digit code sent to your email.' + otpText;
                }
                if (twoFactorCodeInput) {
                    twoFactorCodeInput.value = '';
                    twoFactorCodeInput.focus();
                }

                alert('Password correct. Please enter your 2FA code.');

                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                return;
            }

            // If no 2FA (fallback, not expected here)
            alert('Login successful (no 2FA).');
            logFrontendEvent('info', 'Login successful without 2FA (fallback)', {
                email: email
            });

            submitButton.innerHTML = originalText;
            submitButton.disabled = false;

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        })
        .catch(function(err) {
            console.error('Login request failed:', err);
            alert('Network error during login. Please try again.');
            logFrontendEvent('error', 'Login request failed', {
                email: email,
                error: err.message
            });

            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        });
    } else {
        // Form is invalid, show validation messages
        form.classList.add('was-validated');

        logFrontendEvent('warning', 'Login form invalid on submit');
    }
}

/**
 * Initialize 2FA section (step 2)
 */
function initializeTwoFactorSection() {
    const twoFactorForm = document.getElementById('twoFactorForm');
    const twoFactorSection = document.getElementById('twoFactorSection');

    if (twoFactorForm && twoFactorSection) {
        twoFactorForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (!twoFactorForm.checkValidity()) {
                twoFactorForm.classList.add('was-validated');
                logFrontendEvent('warning', '2FA form invalid on submit');
                return;
            }

            if (!currentLoginEmailFor2FA) {
                alert('No login is in progress. Please log in again.');
                logFrontendEvent('warning', '2FA submit without login context');
                return;
            }

            const codeInput = document.getElementById('twoFactorCode');
            const code = codeInput ? codeInput.value.trim() : '';

            const button = twoFactorForm.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verifying...';

            fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentLoginEmailFor2FA,
                    code: code
                })
            })
            .then(async function(response) {
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    const msg = data.message || '2FA verification failed.';
                    alert(msg);
                    logFrontendEvent('warning', '2FA verification failed', {
                        email: currentLoginEmailFor2FA,
                        status: response.status,
                        message: msg
                    });

                    button.innerHTML = originalText;
                    button.disabled = false;
                    return;
                }

                // 2FA success
                alert('2FA verification successful. You are now logged in.');
                logFrontendEvent('info', '2FA verification successful', {
                    email: currentLoginEmailFor2FA
                });

                // Clear state
                currentLoginEmailFor2FA = null;

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            })
            .catch(function(err) {
                console.error('2FA verify request failed:', err);
                alert('Network error during 2FA verification. Please try again.');
                logFrontendEvent('error', '2FA verify request failed', {
                    email: currentLoginEmailFor2FA,
                    error: err.message
                });

                button.innerHTML = originalText;
                button.disabled = false;
            });
        });
    }
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

            logFrontendEvent('info', 'Password visibility toggled', {
                visible: type === 'text'
            });
        });
    }
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    // Get all forms with validation
    const forms = document.querySelectorAll('.needs-validation, #loginForm');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                logFrontendEvent('warning', 'Form submission blocked due to validation failure');
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

/**
 * Handle presale code application
 */
function handlePresaleCode() {
    const presaleCodeInput = document.getElementById('presaleCode');
    
    if (presaleCodeInput) {
        const code = presaleCodeInput.value.trim();
        
        if (code) {
            // Presale code validation will be implemented in future milestones
            alert('Presale code functionality will be implemented in future milestones.\n\nCode: ' + code);

            logFrontendEvent('info', 'Presale code entered', {
                code: code
            });
        } else {
            alert('Please enter a presale code.');

            logFrontendEvent('warning', 'Presale code submit with empty value');
        }
    }
}

// Add event listener for presale code button if it exists
document.addEventListener('DOMContentLoaded', function() {
    const presaleCodeButton = document.querySelector('#presaleCode')?.parentElement?.querySelector('button');
    
    if (presaleCodeButton) {
        logFrontendEvent('info', 'Presale section initialized');
        presaleCodeButton.addEventListener('click', handlePresaleCode);
    }
    
    // Also handle Enter key on presale code input
    const presaleCodeInput = document.getElementById('presaleCode');
    if (presaleCodeInput) {
        presaleCodeInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handlePresaleCode();
            }
        });
    }
});

/**
 * Smooth scroll for anchor links
 */
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

                logFrontendEvent('info', 'Smooth scroll link clicked', {
                    href: href
                });
            }
        }
    });
});

/**
 * Add animation on scroll (optional enhancement)
 */
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .event-card');
    
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
