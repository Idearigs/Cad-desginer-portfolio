/**
 * Modern Carousel Component
 * Handles carousel navigation with smooth transitions and touch support
 */

(function() {
    'use strict';
    
    let currentIndex = 0;
    let isTransitioning = false;
    let cardsPerView = 4;
    
    function initCarousel() {
        const container = document.querySelector('.lx-carousel-container');
        if (!container) {
            console.log('Carousel container not found');
            return;
        }
        
        const carousel = container.querySelector('.lx-carousel');
        const track = carousel?.querySelector('.lx-carousel-track');
        const slides = track?.querySelectorAll('.lx-slide');
        const prevBtn = container.querySelector('.carousel-nav--prev');
        const nextBtn = container.querySelector('.carousel-nav--next');
        
        if (!track || !slides.length || !prevBtn || !nextBtn) {
            console.warn('Missing carousel elements');
            return;
        }
        
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
        
        // Event listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                updateCardsPerView();
                const maxIndex = getMaxIndex();
                
                // Adjust current index if needed
                if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }
                
                moveCarousel();
            }, 250);
        });
        
        // Touch/swipe support
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let startTime = 0;
        
        track.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startTime = Date.now();
            isDragging = true;
            track.style.cursor = 'grabbing';
        });
        
        track.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.touches[0].clientX;
            
            // Optional: Show live drag preview
            const diff = currentX - startX;
            const slideStep = getSlideStep();
            const currentTranslate = -(currentIndex * slideStep);
            track.style.transform = `translateX(${currentTranslate + diff * 0.3}px)`;
        });
        
        track.addEventListener('touchend', function() {
            if (!isDragging) return;
            isDragging = false;
            track.style.cursor = 'grab';
            
            const diff = startX - currentX;
            const timeDiff = Date.now() - startTime;
            const velocity = Math.abs(diff) / timeDiff;
            
            // Determine if swipe was significant enough
            const threshold = velocity > 0.5 ? 30 : 80;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            } else {
                // Snap back to current position
                moveCarousel();
            }
        });
        
        // Mouse drag support for desktop
        let isMouseDown = false;
        
        track.addEventListener('mousedown', function(e) {
            e.preventDefault();
            startX = e.clientX;
            startTime = Date.now();
            isMouseDown = true;
            track.style.cursor = 'grabbing';
        });
        
        track.addEventListener('mousemove', function(e) {
            if (!isMouseDown) return;
            e.preventDefault();
            currentX = e.clientX;
            
            const diff = currentX - startX;
            const slideStep = getSlideStep();
            const currentTranslate = -(currentIndex * slideStep);
            track.style.transform = `translateX(${currentTranslate + diff * 0.3}px)`;
        });
        
        track.addEventListener('mouseup', function() {
            if (!isMouseDown) return;
            isMouseDown = false;
            track.style.cursor = 'grab';
            
            const diff = startX - currentX;
            const timeDiff = Date.now() - startTime;
            const velocity = Math.abs(diff) / timeDiff;
            
            const threshold = velocity > 0.5 ? 30 : 80;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            } else {
                moveCarousel();
            }
        });
        
        track.addEventListener('mouseleave', function() {
            if (isMouseDown) {
                isMouseDown = false;
                track.style.cursor = 'grab';
                moveCarousel();
            }
        });
        
        // Initialize
        updateCardsPerView();
        updateButtons();
        track.style.cursor = 'grab';
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousel);
    } else {
        initCarousel();
    }
    
})();