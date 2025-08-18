/**
 * Simple Carousel Component
 * Clean, straightforward carousel with proper touch/swipe support
 */

(function() {
    'use strict';
    
    let currentIndex = 0;
    let isTransitioning = false;
    let cardsPerView = 4;
    
    function initCarousel() {
        const container = document.querySelector('.lx-carousel-container');
        if (!container) return;
        
        const carousel = container.querySelector('.lx-carousel');
        const track = carousel?.querySelector('.lx-carousel-track');
        const slides = track?.querySelectorAll('.lx-slide');
        const prevBtn = container.querySelector('.carousel-nav--prev');
        const nextBtn = container.querySelector('.carousel-nav--next');
        
        if (!track || !slides.length || !prevBtn || !nextBtn) return;
        
        // Calculate responsive cards per view
        function updateCardsPerView() {
            const viewportWidth = window.innerWidth;
            if (viewportWidth <= 640) {
                cardsPerView = 1;
            } else if (viewportWidth <= 768) {
                cardsPerView = 2;
            } else if (viewportWidth <= 1099) {
                cardsPerView = 2;
            } else if (viewportWidth <= 1399) {
                cardsPerView = 3;
            } else {
                cardsPerView = 4;
            }
        }
        
        // Get slide width including gap
        function getSlideStep() {
            const slideWidth = slides[0].offsetWidth;
            const computedStyle = window.getComputedStyle(track);
            const gap = parseFloat(computedStyle.gap) || 24;
            return slideWidth + gap;
        }
        
        // Calculate max index
        function getMaxIndex() {
            return Math.max(0, slides.length - cardsPerView);
        }
        
        // Update button states
        function updateButtons() {
            const maxIndex = getMaxIndex();
            
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex;
            
            prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
            nextBtn.style.opacity = currentIndex >= maxIndex ? '0.3' : '1';
        }
        
        // Move carousel
        function moveCarousel() {
            if (isTransitioning) return;
            
            isTransitioning = true;
            const slideStep = getSlideStep();
            const translateX = -(currentIndex * slideStep);
            track.style.transform = `translateX(${translateX}px)`;
            
            setTimeout(() => {
                isTransitioning = false;
            }, 500);
            
            updateButtons();
        }
        
        // Next slide
        function nextSlide() {
            const maxIndex = getMaxIndex();
            if (currentIndex < maxIndex) {
                currentIndex++;
                moveCarousel();
            }
        }
        
        // Previous slide
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                moveCarousel();
            }
        }
        
        // Button event listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        // Simple touch/swipe support (no drag preview)
        let startX = 0;
        let startY = 0;
        let isSwiping = false;
        
        track.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = true;
        });
        
        track.addEventListener('touchmove', function(e) {
            if (!isSwiping) return;
            
            // Prevent scrolling only if horizontal swipe
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(currentX - startX);
            const diffY = Math.abs(currentY - startY);
            
            if (diffX > diffY) {
                e.preventDefault();
            }
        });
        
        track.addEventListener('touchend', function(e) {
            if (!isSwiping) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            const threshold = 50; // Minimum swipe distance
            
            isSwiping = false;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Swiped left -> next slide
                    nextSlide();
                } else {
                    // Swiped right -> previous slide
                    prevSlide();
                }
            }
        });
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                updateCardsPerView();
                const maxIndex = getMaxIndex();
                
                if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }
                
                moveCarousel();
            }, 250);
        });
        
        // Initialize
        updateCardsPerView();
        updateButtons();
        track.style.cursor = 'grab';
        
        console.log('Simple carousel initialized successfully');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousel);
    } else {
        initCarousel();
    }
    
})();