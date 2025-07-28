/**
 * Luxury Reveal Animations + Carousel Controls
 * Refined scroll-triggered reveals with premium timing
 */

(function() {
    'use strict';
    
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Add reveal class immediately for reduced motion users
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('[data-reveal]');
            elements.forEach(el => el.classList.add('reveal-in'));
        });
        return;
    }
    
    // Enhanced observer options for luxury experience
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -8% 0px', // Trigger when 8% visible
        threshold: 0.1
    };
    
    // Create refined intersection observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Calculate stagger delay based on element position
                let delay = parseInt(element.dataset.delay) || 0;
                
                // Auto-calculate stagger for grid items if no manual delay
                if (!element.dataset.delay) {
                    const container = element.closest('.lx-grid, .lx-carousel');
                    if (container) {
                        const siblings = Array.from(container.querySelectorAll('[data-reveal]'));
                        const index = siblings.indexOf(element);
                        delay = index * 80; // 80ms stagger between items
                    }
                }
                
                // Apply reveal with sophisticated timing
                setTimeout(() => {
                    element.classList.add('reveal-in');
                }, delay);
                
                // Stop observing once revealed for performance
                revealObserver.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Initialize carousel controls
    function initCarouselControls() {
        const prevBtns = document.querySelectorAll('.lx-carousel__btn--prev');
        const nextBtns = document.querySelectorAll('.lx-carousel__btn--next');
        
        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const carousel = btn.closest('.lx-section').querySelector('.lx-carousel');
                if (carousel) {
                    carousel.scrollBy({
                        left: -360,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const carousel = btn.closest('.lx-section').querySelector('.lx-carousel');
                if (carousel) {
                    carousel.scrollBy({
                        left: 360,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Initialize luxury reveal system
    function initLuxuryReveals() {
        const revealElements = document.querySelectorAll('[data-reveal]');
        
        revealElements.forEach((element) => {
            // Set up refined animation classes
            element.style.willChange = 'opacity, transform';
            
            // Start observing
            revealObserver.observe(element);
        });
        
        // Initialize carousel controls
        initCarouselControls();
    }
    
    // Start the luxury reveal system
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLuxuryReveals);
    } else {
        initLuxuryReveals();
    }
    
})();