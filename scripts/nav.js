/**
 * Premium Mobile Navigation - Luxury Jewelry Brand
 * Handles menu toggle, focus trap, scroll lock, and accessibility
 */

(function() {
    'use strict';
    
    // DOM Elements
    const toggle = document.querySelector('.mnav__toggle');
    const panel = document.querySelector('.mnav__panel');
    const backdrop = document.querySelector('.mnav__backdrop');
    const sheet = document.querySelector('.mnav__sheet');
    const closeButtons = document.querySelectorAll('[data-close]');
    const menuLinks = document.querySelectorAll('.mnav__link');
    
    // State
    let isOpen = false;
    let focusableElements = [];
    let firstFocusable = null;
    let lastFocusable = null;
    let previousFocus = null;
    
    // Initialize navigation
    function init() {
        if (!toggle || !panel) return;
        
        // Bind events
        toggle.addEventListener('click', handleToggle);
        backdrop?.addEventListener('click', closeMenu);
        document.addEventListener('keydown', handleKeydown);
        
        // Bind close buttons
        closeButtons.forEach(btn => {
            btn.addEventListener('click', closeMenu);
        });
        
        // Bind menu links to close on navigation
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Small delay to allow navigation to complete
                setTimeout(closeMenu, 100);
            });
        });
        
        // Set up focusable elements
        updateFocusableElements();
    }
    
    // Toggle menu open/closed
    function handleToggle() {
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Open menu
    function openMenu() {
        if (isOpen) return;
        
        isOpen = true;
        previousFocus = document.activeElement;
        
        // Update DOM
        toggle.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
        document.body.setAttribute('data-open', '');
        
        // Update focusable elements for current state
        updateFocusableElements();
        
        // Focus first element after animation
        setTimeout(() => {
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);
    }
    
    // Close menu
    function closeMenu() {
        if (!isOpen) return;
        
        isOpen = false;
        
        // Update DOM
        toggle.setAttribute('aria-expanded', 'false');
        panel.setAttribute('hidden', '');
        document.body.removeAttribute('data-open');
        
        // Return focus to toggle button
        if (previousFocus && document.contains(previousFocus)) {
            previousFocus.focus();
        } else {
            toggle.focus();
        }
        
        previousFocus = null;
    }
    
    // Handle keyboard events
    function handleKeydown(e) {
        // Close on Escape
        if (e.key === 'Escape' && isOpen) {
            closeMenu();
            return;
        }
        
        // Focus trap when menu is open
        if (isOpen && e.key === 'Tab') {
            handleTabKey(e);
        }
    }
    
    // Handle Tab key for focus trap
    function handleTabKey(e) {
        if (!firstFocusable || !lastFocusable) return;
        
        // Shift + Tab (backwards)
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } 
        // Tab (forwards)
        else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }
    
    // Update focusable elements
    function updateFocusableElements() {
        if (!sheet) return;
        
        const focusableSelectors = [
            'button:not([disabled])',
            'a[href]:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"]):not([disabled])'
        ].join(', ');
        
        focusableElements = Array.from(sheet.querySelectorAll(focusableSelectors));
        
        // Filter out hidden elements
        focusableElements = focusableElements.filter(el => {
            return el.offsetWidth > 0 && el.offsetHeight > 0 && 
                   window.getComputedStyle(el).visibility !== 'hidden';
        });
        
        firstFocusable = focusableElements[0] || null;
        lastFocusable = focusableElements[focusableElements.length - 1] || null;
    }
    
    // Update active states based on current page/section
    function updateActiveStates() {
        const currentHash = window.location.hash || '#hero';
        const currentPath = window.location.pathname;
        
        menuLinks.forEach(link => {
            link.classList.remove('is-active');
            
            const href = link.getAttribute('href');
            
            // Check for hash matches (sections)
            if (href?.startsWith('#') && href === currentHash) {
                link.classList.add('is-active');
            }
            // Check for page matches
            else if (href && !href.startsWith('#') && currentPath.includes(href)) {
                link.classList.add('is-active');
            }
            // Default to home if no other matches
            else if (href === '#hero' && (currentHash === '' || currentHash === '#')) {
                link.classList.add('is-active');
            }
        });
    }
    
    // Handle window resize
    function handleResize() {
        // Close menu if resized to desktop
        if (window.innerWidth > 1024 && isOpen) {
            closeMenu();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Update active states on load and hash change
    window.addEventListener('load', updateActiveStates);
    window.addEventListener('hashchange', updateActiveStates);
    window.addEventListener('resize', handleResize);
    
    // Expose global function for legacy compatibility
    window.toggleMobileMenu = handleToggle;
    
})();