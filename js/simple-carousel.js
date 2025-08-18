class CardCarousel {
    constructor() {
        this.currentIndex = 0;
        this.cards = [];
        this.indicators = [];
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.carousel = document.getElementById('cardCarousel');
        if (!this.carousel) return;
        
        this.track = document.getElementById('carouselTrack');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.indicatorsContainer = document.getElementById('carouselIndicators');
        
        if (!this.track) return;
        
        this.cards = Array.from(this.track.querySelectorAll('.card'));
        this.totalCards = this.cards.length;
        
        this.calculateDimensions();
        this.createIndicators();
        this.setupEventListeners();
        this.updateCarousel();
        this.startAutoPlay();
        
        window.addEventListener('resize', () => {
            this.calculateDimensions();
            this.updateCarousel();
        });
    }
    
    calculateDimensions() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth >= 1200) {
            this.cardsPerView = 3;
            this.cardWidth = 320;
            this.cardGap = 32;
        } else if (screenWidth >= 768) {
            this.cardsPerView = 2;
            this.cardWidth = 280;
            this.cardGap = 24;
        } else {
            this.cardsPerView = 1;
            this.cardWidth = screenWidth >= 480 ? 260 : 240;
            this.cardGap = 16;
        }
        
        this.maxIndex = Math.max(0, this.totalCards - this.cardsPerView);
        
        if (this.currentIndex > this.maxIndex) {
            this.currentIndex = this.maxIndex;
        }
    }
    
    createIndicators() {
        if (!this.indicatorsContainer) return;
        
        this.indicatorsContainer.innerHTML = '';
        this.indicators = [];
        
        for (let i = 0; i <= this.maxIndex; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'indicator';
            if (i === 0) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                this.goToSlide(i);
            });
            
            this.indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        }
    }
    
    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
        
        this.carousel.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });
        
        this.carousel.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            this.stopAutoPlay();
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe(touchStartX, touchEndX);
            this.startAutoPlay();
        }, { passive: true });
    }
    
    handleSwipe(startX, endX) {
        const diff = startX - endX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        
        this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        
        if (this.currentIndex < this.maxIndex) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0; // Loop back to start
        }
        
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    prevSlide() {
        if (this.isTransitioning) return;
        
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = this.maxIndex; // Loop to end
        }
        
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    updateCarousel() {
        if (!this.track || this.cards.length === 0) return;
        
        this.isTransitioning = true;
        
        const translateX = -(this.currentIndex * (this.cardWidth + this.cardGap));
        
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
        
        // Reset transition flag
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 4000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        setTimeout(() => {
            this.startAutoPlay();
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CardCarousel();
});