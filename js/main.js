/**
 * EventEase - Main JavaScript File
 * Handles form validation, interactivity, and user interactions
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
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
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
        submitButton.disabled = true;
        
        // Simulate login process (replace with actual API call in future milestones)
        setTimeout(() => {
            // For now, just show success message
            alert('Login functionality will be implemented in future milestones.\n\nEmail: ' + formData.email + '\nRemember Me: ' + formData.rememberMe);
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // In production, redirect to dashboard or home page
            // window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        // Form is invalid, show validation messages
        form.classList.add('was-validated');
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
        });
    }
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    // Get all forms with validation
    const forms = document.querySelectorAll('.needs-validation, #loginForm');
    
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
 * Handle presale code application
 */
function handlePresaleCode() {
    const presaleCodeInput = document.getElementById('presaleCode');
    
    if (presaleCodeInput) {
        const code = presaleCodeInput.value.trim();
        
        if (code) {
            // Presale code validation will be implemented in future milestones
            alert('Presale code functionality will be implemented in future milestones.\n\nCode: ' + code);
        } else {
            alert('Please enter a presale code.');
        }
    }
}

// Add event listener for presale code button if it exists
document.addEventListener('DOMContentLoaded', function() {
    const presaleCodeButton = document.querySelector('#presaleCode')?.parentElement?.querySelector('button');
    
    if (presaleCodeButton) {
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

// Initialize scroll animations if supported
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', animateOnScroll);
}

