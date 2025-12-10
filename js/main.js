/**
 * EventEase - Main JavaScript File
 * Handles form validation, interactivity, and user interactions
 */

/**
 * Frontend logging helper
 * Sends logs to the backend logging endpoint
 */
function logFrontendEvent(level, message, context = {}) {
    try {
        fetch('http://localhost:5000/api/log/frontend', {
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
 * Handle login form submission
 */
function handleLoginSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target;
    
    // Check if form is valid
    if (form.checkValidity()) {
        // Get form data
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            rememberMe: document.getElementById('rememberMe').checked
        };

        // Log login attempt (do NOT log password)
        logFrontendEvent('info', 'Login form submitted', {
            email: formData.email,
            rememberMe: formData.rememberMe
        });
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
        submitButton.disabled = true;
        
        // Simulate login process (replace with actual API call in future milestones)
        setTimeout(function() {
            // For now, just show success message
            alert(
                'Login functionality will be implemented in future milestones.\n\nEmail: ' + 
                formData.email + '\nRemember Me: ' + formData.rememberMe
            );

            // Log simulated success
            logFrontendEvent('info', 'Simulated login success (placeholder)', {
                email: formData.email,
                rememberMe: formData.rememberMe
            });
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // In production, redirect to dashboard or home page
            // window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        // Form is invalid, show validation messages
        form.classList.add('was-validated');

        logFrontendEvent('warning', 'Login form invalid on submit');
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
