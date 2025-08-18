/**
 * Fixed Carousel - Clean Swipe Implementation
 * Works with original HTML structure but improved touch handling
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
            console.warn('Missing carousel elements', {
                track: !!track,
                slides: slides?.length,
                prevBtn: !!prevBtn,
                nextBtn: !!nextBtn
            });
            return;
        }
        
        console.log(`Carousel initialized with ${slides.length} slides`);
        
        // Debug: Check if images are loading
        slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                console.log(`Slide ${index}: Image src = ${img.src}`);
                if (img.complete) {
                    console.log(`Slide ${index}: Image already loaded`);
                } else {
                    img.onload = () => console.log(`Slide ${index}: Image loaded successfully`);
                    img.onerror = () => console.log(`Slide ${index}: Image failed to load - ${img.src}`);
                }
            }
        });
        
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
        
        // Calculate max index - how far we can scroll
        function getMaxIndex() {
            // Standard calculation: total slides minus visible cards
            // This ensures we don't scroll past the last visible slide
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
        
        // Next slide with proper bounds checking
        function nextSlide() {
            const maxIndex = getMaxIndex();
            if (currentIndex < maxIndex) {
                currentIndex++;
                console.log(`Moving to slide ${currentIndex} (max: ${maxIndex})`);
                moveCarousel();
            } else {
                console.log(`Already at last slide (${currentIndex}/${maxIndex})`);
            }
        }
        
        // Previous slide with proper bounds checking  
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                console.log(`Moving to slide ${currentIndex}`);
                moveCarousel();
            } else {
                console.log(`Already at first slide`);
            }
        }
        
        // Button event listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        // Clean touch/swipe support - NO DRAG PREVIEW
        let touchStart = null;
        let touchStartY = null;
        
        track.addEventListener('touchstart', function(e) {
            touchStart = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        track.addEventListener('touchmove', function(e) {
            if (touchStart === null || touchStartY === null) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const diffX = Math.abs(currentX - touchStart);
            const diffY = Math.abs(currentY - touchStartY);
            
            // Only prevent default if it's clearly a horizontal swipe
            if (diffX > diffY && diffX > 10) {
                e.preventDefault();
            }
        }, { passive: false });
        
        track.addEventListener('touchend', function(e) {
            if (touchStart === null) return;
            
            const touchEnd = e.changedTouches[0].clientX;
            const diff = touchStart - touchEnd;
            const threshold = 50;
            
            // Reset touch tracking
            touchStart = null;
            touchStartY = null;
            
            // Determine swipe direction
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swiped left -> next slide
                    nextSlide();
                } else {
                    // Swiped right -> previous slide
                    prevSlide();
                }
            }
        }, { passive: true });
        
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
        
        console.log('Fixed carousel ready with clean swipe support');
        console.log(`Configuration: ${slides.length} slides, ${cardsPerView} cards per view, max index: ${getMaxIndex()}`);
        console.log(`Mobile device: ${window.innerWidth <= 768 ? 'YES' : 'NO'} (width: ${window.innerWidth}px)`);
        
        // Mobile-specific debugging
        if (window.innerWidth <= 768) {
            console.log('MOBILE MODE: Checking card dimensions...');
            slides.forEach((slide, index) => {
                const card = slide.querySelector('.lx-card');
                const media = slide.querySelector('.lx-card__media');
                const img = slide.querySelector('img');
                if (card) {
                    const rect = card.getBoundingClientRect();
                    console.log(`Slide ${index}: Card dimensions - ${rect.width}x${rect.height}`);
                    console.log(`Slide ${index}: Card styles - ${window.getComputedStyle(card).display}, visibility: ${window.getComputedStyle(card).visibility}`);
                }
                if (img) {
                    console.log(`Slide ${index}: Image natural size - ${img.naturalWidth}x${img.naturalHeight}`);
                }
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousel);
    } else {
        initCarousel();
    }
    
})();