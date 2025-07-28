/**
 * Mobile Navigation Controller
 * Handles mobile drawer open/close functionality
 */

(function() {
    'use strict';
    
    // DOM Elements
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileDrawerClose = document.getElementById('mobileDrawerClose');
    const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    // State
    let isDrawerOpen = false;
    
    // Initialize mobile navigation
    function init() {
        console.log('Initializing mobile nav...', { mobileMenuToggle, mobileDrawer });
        
        if (!mobileMenuToggle || !mobileDrawer) {
            console.error('Mobile nav elements not found');
            return;
        }
        
        // Bind events
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Toggle clicked');
            toggleDrawer();
        });
        
        mobileDrawerClose?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeDrawer();
        });
        
        mobileDrawerOverlay?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeDrawer();
        });
        
        // Close drawer when navigation links are clicked
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeDrawer, 100);
            });
        });
        
        // Handle escape key
        document.addEventListener('keydown', handleKeydown);
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
        
        console.log('Mobile nav initialized successfully');
    }
    
    // Toggle drawer open/closed
    function toggleDrawer() {
        if (isDrawerOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }
    
    // Open drawer
    function openDrawer() {
        console.log('Opening drawer...');
        if (isDrawerOpen) return;
        
        isDrawerOpen = true;
        
        // Update attributes
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        mobileDrawer.classList.add('active');
        mobileDrawer.style.visibility = 'visible';
        mobileDrawer.style.opacity = '1';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        console.log('Drawer opened', { isDrawerOpen, classes: mobileDrawer.classList });
        
        // Focus management
        setTimeout(() => {
            if (mobileDrawerClose) {
                mobileDrawerClose.focus();
            }
        }, 300);
    }
    
    // Close drawer
    function closeDrawer() {
        console.log('Closing drawer...');
        if (!isDrawerOpen) return;
        
        isDrawerOpen = false;
        
        // Update attributes
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('active');
        mobileDrawer.style.visibility = 'hidden';
        mobileDrawer.style.opacity = '0';
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        console.log('Drawer closed');
        
        // Return focus to toggle button
        mobileMenuToggle.focus();
    }
    
    // Handle keyboard events
    function handleKeydown(e) {
        // Close on Escape
        if (e.key === 'Escape' && isDrawerOpen) {
            closeDrawer();
        }
    }
    
    // Handle window resize
    function handleResize() {
        // Close drawer if window becomes desktop size
        if (window.innerWidth >= 768 && isDrawerOpen) {
            closeDrawer();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();