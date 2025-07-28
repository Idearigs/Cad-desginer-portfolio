/**
 * Bäumer-Style Header Navigation
 * Handles mobile drawer toggle, accordion sections, and focus management
 */

(function() {
    'use strict';
    
    // DOM Elements
    const menuBtn = document.querySelector('.header__menu-btn');
    const drawer = document.querySelector('.header__drawer');
    const closeBtn = document.querySelector('.header__drawer-close');
    const sectionBtns = document.querySelectorAll('.header__section-btn');
    const navLinks = document.querySelectorAll('.header__nav-link');
    
    // State
    let isDrawerOpen = false;
    let focusableElements = [];
    let firstFocusable = null;
    let lastFocusable = null;
    let previousFocus = null;
    
    // Initialize header functionality
    function init() {
        if (!menuBtn || !drawer) return;
        
        // Bind drawer toggle events
        menuBtn.addEventListener('click', toggleDrawer);
        closeBtn?.addEventListener('click', closeDrawer);
        
        // Bind keyboard events
        document.addEventListener('keydown', handleKeydown);
        
        // Bind accordion functionality
        sectionBtns.forEach(btn => {
            btn.addEventListener('click', toggleAccordion);
        });
        
        // Bind navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Small delay to allow navigation to complete
                setTimeout(closeDrawer, 100);
            });
        });
        
        // Update focusable elements
        updateFocusableElements();
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
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
        if (isDrawerOpen) return;
        
        isDrawerOpen = true;
        previousFocus = document.activeElement;
        
        // Update DOM
        menuBtn.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('data-open', '');
        document.body.setAttribute('data-drawer-open', '');
        
        // Update focusable elements
        updateFocusableElements();
        
        // Focus first element after animation
        setTimeout(() => {
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 50);
    }
    
    // Close drawer
    function closeDrawer() {
        if (!isDrawerOpen) return;
        
        isDrawerOpen = false;
        
        // Update DOM
        menuBtn.setAttribute('aria-expanded', 'false');
        drawer.removeAttribute('data-open');
        document.body.removeAttribute('data-drawer-open');
        
        // Collapse all accordion sections
        sectionBtns.forEach(btn => {
            const content = document.getElementById(btn.getAttribute('aria-controls'));
            if (content) {
                btn.setAttribute('aria-expanded', 'false');
                content.removeAttribute('data-open');
            }
        });
        
        // Return focus
        if (previousFocus && document.contains(previousFocus)) {
            previousFocus.focus();
        } else {
            menuBtn.focus();
        }
        
        previousFocus = null;
    }
    
    // Toggle accordion sections
    function toggleAccordion(e) {
        const btn = e.currentTarget;
        const contentId = btn.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        
        if (!content) return;
        
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        
        // Close all other sections first
        sectionBtns.forEach(otherBtn => {
            if (otherBtn !== btn) {
                const otherContentId = otherBtn.getAttribute('aria-controls');
                const otherContent = document.getElementById(otherContentId);
                if (otherContent) {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    otherContent.removeAttribute('data-open');
                }
            }
        });
        
        // Toggle current section
        if (isExpanded) {
            btn.setAttribute('aria-expanded', 'false');
            content.removeAttribute('data-open');
        } else {
            btn.setAttribute('aria-expanded', 'true');
            content.setAttribute('data-open', '');
        }
        
        // Update focusable elements
        updateFocusableElements();
    }
    
    // Handle keyboard events
    function handleKeydown(e) {
        // Close on Escape
        if (e.key === 'Escape' && isDrawerOpen) {
            closeDrawer();
            return;
        }
        
        // Focus trap when drawer is open
        if (isDrawerOpen && e.key === 'Tab') {
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
        if (!drawer) return;
        
        const focusableSelectors = [
            'button:not([disabled])',
            'a[href]:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"]):not([disabled])'
        ].join(', ');
        
        focusableElements = Array.from(drawer.querySelectorAll(focusableSelectors));
        
        // Filter out hidden elements
        focusableElements = focusableElements.filter(el => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.visibility !== 'hidden' && 
                   style.display !== 'none' && 
                   rect.width > 0 && 
                   rect.height > 0;
        });
        
        firstFocusable = focusableElements[0] || null;
        lastFocusable = focusableElements[focusableElements.length - 1] || null;
    }
    
    // Handle window resize
    function handleResize() {
        // Close drawer if window becomes desktop size
        if (window.innerWidth >= 1024 && isDrawerOpen) {
            closeDrawer();
        }
    }
    
    // Update active states based on current page
    function updateActiveStates() {
        const currentHash = window.location.hash || '#hero';
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            
            const href = link.getAttribute('href');
            
            // Check for hash matches (sections)
            if (href?.startsWith('#') && href === currentHash) {
                link.setAttribute('aria-current', 'page');
            }
            // Check for page matches
            else if (href && !href.startsWith('#') && currentPath.includes(href)) {
                link.setAttribute('aria-current', 'page');
            }
            // Default to home if no other matches
            else if (href === '#hero' && (currentHash === '' || currentHash === '#')) {
                link.setAttribute('aria-current', 'page');
            }
        });
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
    
})();