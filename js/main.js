// Main JavaScript - Global Functions

// Navigation Functions
let isScrolled = false;
let isMobileMenuOpen = false;

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
    // Handle scroll events for navigation
    window.addEventListener('scroll', handleNavScroll);
    
    // Initialize any other global functionality
    initializeGlobalFeatures();
});

function handleNavScroll() {
    const navigation = document.getElementById('navigation');
    const scrollY = window.scrollY;
    
    if (scrollY > 50 && !isScrolled) {
        isScrolled = true;
        navigation.classList.remove('nav-transparent');
        navigation.classList.add('nav-scrolled');
    } else if (scrollY <= 50 && isScrolled) {
        isScrolled = false;
        navigation.classList.remove('nav-scrolled');
        navigation.classList.add('nav-transparent');
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (isMobileMenuOpen) {
        mobileMenu.classList.add('active');
        mobileBtn.classList.add('active');
    } else {
        mobileMenu.classList.remove('active');
        mobileBtn.classList.remove('active');
    }
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Close mobile menu if open
    if (isMobileMenuOpen) {
        toggleMobileMenu();
    }
}

// Toast Notification System
function showToast(title, message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-header">${title}</div>
        <div class="toast-message">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Contact Form Handler
function submitForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Simulate form submission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showToast(
            'Message sent successfully!',
            'Thank you for reaching out. I\'ll get back to you soon.',
            'success'
        );
        
        // Reset form
        form.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Initialize global features
function initializeGlobalFeatures() {
    // Add any global initializations here
    console.log('Global features initialized');
    
    // Handle external links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="http"]');
        if (link && !link.href.includes(window.location.hostname)) {
            e.preventDefault();
            window.open(link.href, '_blank', 'noopener,noreferrer');
        }
    });
}

// Animation helpers
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let opacity = 0;
    const timer = setInterval(() => {
        opacity += 50 / duration;
        if (opacity >= 1) {
            clearInterval(timer);
            opacity = 1;
        }
        element.style.opacity = opacity;
    }, 50);
}

function fadeOut(element, duration = 300) {
    let opacity = 1;
    const timer = setInterval(() => {
        opacity -= 50 / duration;
        if (opacity <= 0) {
            clearInterval(timer);
            opacity = 0;
            element.style.display = 'none';
        }
        element.style.opacity = opacity;
    }, 50);
}

// Error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    // You could send this to an error reporting service
});

// Performance optimization
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Perform low-priority tasks here
        console.log('Idle callback executed');
    });
}

// Export functions for global use
window.globalUtils = {
    showToast,
    fadeIn,
    fadeOut,
    debounce,
    throttle,
    scrollToSection,
    toggleMobileMenu,
    submitForm
};