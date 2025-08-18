/**
 * Expert Carousel Component - Modern JavaScript Implementation
 * Built with ES6+ classes, modern APIs, and best practices
 * Features: Touch/swipe, keyboard navigation, accessibility, performance optimization
 */

class ExpertCarousel {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) {
      console.warn(`Carousel container "${selector}" not found`);
      return;
    }
    
    this.initializeElements();
    this.initializeState();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.updateView();
    this.generateIndicators();
    
    console.log('Expert Carousel initialized successfully');
  }
  
  initializeElements() {
    this.track = this.container.querySelector('.expert-track');
    this.slides = Array.from(this.container.querySelectorAll('.expert-slide'));
    this.prevButton = this.container.querySelector('.expert-nav--prev');
    this.nextButton = this.container.querySelector('.expert-nav--next');
    this.indicatorsContainer = this.container.querySelector('.expert-indicators');
    
    if (!this.track || !this.slides.length) {
      console.error('Carousel elements found:', {
        track: !!this.track,
        slides: this.slides.length,
        prevButton: !!this.prevButton,
        nextButton: !!this.nextButton
      });
      throw new Error('Required carousel elements not found');
    }
    
    console.log(`Expert carousel found ${this.slides.length} slides`);
  }
  
  initializeState() {
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.itemsPerView = this.calculateItemsPerView();
    this.maxIndex = Math.max(0, this.slides.length - this.itemsPerView);
    
    // Touch/swipe state
    this.touchState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      isDragging: false,
      startTime: 0
    };
    
    // Performance optimization
    this.resizeObserver = null;
    this.raf = null;
  }
  
  calculateItemsPerView() {
    const viewportWidth = window.innerWidth;
    
    if (viewportWidth >= 1400) return 4;
    if (viewportWidth >= 1100) return 3;
    if (viewportWidth >= 769) return 2;
    if (viewportWidth >= 641) return 2;
    return 1;
  }
  
  setupEventListeners() {
    // Button navigation
    this.prevButton?.addEventListener('click', () => this.previous());
    this.nextButton?.addEventListener('click', () => this.next());
    
    // Touch events with passive listeners for performance
    this.track.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.track.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.track.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Keyboard navigation
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Window resize with debouncing
    this.setupResizeObserver();
  }
  
  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(
        this.debounce(() => {
          const newItemsPerView = this.calculateItemsPerView();
          if (newItemsPerView !== this.itemsPerView) {
            this.itemsPerView = newItemsPerView;
            this.maxIndex = Math.max(0, this.slides.length - this.itemsPerView);
            this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
            this.updateView();
            this.generateIndicators();
          }
        }, 150)
      );
      this.resizeObserver.observe(this.container);
    } else {
      // Fallback for browsers without ResizeObserver
      window.addEventListener('resize', this.debounce(() => {
        const newItemsPerView = this.calculateItemsPerView();
        if (newItemsPerView !== this.itemsPerView) {
          this.itemsPerView = newItemsPerView;
          this.maxIndex = Math.max(0, this.slides.length - this.itemsPerView);
          this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
          this.updateView();
          this.generateIndicators();
        }
      }, 150));
    }
  }
  
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.willChange = 'transform, opacity';
            } else {
              entry.target.style.willChange = 'auto';
            }
          });
        },
        { threshold: 0.1 }
      );
      
      this.slides.forEach(slide => observer.observe(slide));
    }
  }
  
  handleTouchStart(event) {
    const touch = event.touches[0];
    this.touchState = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isDragging: true,
      startTime: Date.now()
    };
  }
  
  handleTouchMove(event) {
    if (!this.touchState.isDragging) return;
    
    const touch = event.touches[0];
    this.touchState.currentX = touch.clientX;
    
    const deltaX = Math.abs(touch.clientX - this.touchState.startX);
    const deltaY = Math.abs(touch.clientY - this.touchState.startY);
    
    // Prevent vertical scrolling if horizontal swipe is detected
    if (deltaX > deltaY && deltaX > 10) {
      event.preventDefault();
    }
  }
  
  handleTouchEnd() {
    if (!this.touchState.isDragging) return;
    
    const deltaX = this.touchState.startX - this.touchState.currentX;
    const deltaTime = Date.now() - this.touchState.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    const threshold = velocity > 0.5 ? 30 : 80;
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        this.next();
      } else {
        this.previous();
      }
    }
    
    this.touchState.isDragging = false;
  }
  
  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previous();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
      case 'Home':
        event.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        event.preventDefault();
        this.goToSlide(this.maxIndex);
        break;
    }
  }
  
  next() {
    if (this.currentIndex < this.maxIndex) {
      this.goToSlide(this.currentIndex + 1);
    }
  }
  
  previous() {
    if (this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    }
  }
  
  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
    this.updateView();
  }
  
  updateView() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Use RAF for smooth animation
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
    
    this.raf = requestAnimationFrame(() => {
      const slideWidth = this.slides[0]?.offsetWidth || 320;
      const gap = parseFloat(getComputedStyle(this.track).gap) || 24;
      const translateX = -(this.currentIndex * (slideWidth + gap));
      
      this.track.style.transform = `translateX(${translateX}px)`;
      
      // Update button states
      this.updateButtonStates();
      
      // Update indicators
      this.updateIndicators();
      
      // Update ARIA attributes
      this.updateAriaAttributes();
      
      // Reset transition flag
      setTimeout(() => {
        this.isTransitioning = false;
      }, 600);
    });
  }
  
  updateButtonStates() {
    if (this.prevButton) {
      this.prevButton.disabled = this.currentIndex === 0;
      this.prevButton.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
    }
    
    if (this.nextButton) {
      this.nextButton.disabled = this.currentIndex >= this.maxIndex;
      this.nextButton.style.opacity = this.currentIndex >= this.maxIndex ? '0.3' : '1';
    }
  }
  
  generateIndicators() {
    if (!this.indicatorsContainer) return;
    
    const indicatorCount = this.maxIndex + 1;
    this.indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i < indicatorCount; i++) {
      const indicator = document.createElement('button');
      indicator.className = 'expert-indicator';
      indicator.setAttribute('role', 'tab');
      indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
      indicator.addEventListener('click', () => this.goToSlide(i));
      this.indicatorsContainer.appendChild(indicator);
    }
    
    this.indicators = Array.from(this.indicatorsContainer.querySelectorAll('.expert-indicator'));
    this.updateIndicators();
  }
  
  updateIndicators() {
    if (!this.indicators) return;
    
    this.indicators.forEach((indicator, index) => {
      const isActive = index === this.currentIndex;
      indicator.classList.toggle('active', isActive);
      indicator.setAttribute('aria-selected', isActive.toString());
    });
  }
  
  updateAriaAttributes() {
    // Update live region for screen readers
    const liveRegion = this.container.querySelector('[aria-live]');
    if (liveRegion) {
      liveRegion.textContent = `Showing items ${this.currentIndex + 1} to ${Math.min(this.currentIndex + this.itemsPerView, this.slides.length)} of ${this.slides.length}`;
    }
  }
  
  // Utility functions
  debounce(func, wait) {
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
  
  // Cleanup method for proper disposal
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
    
    // Remove event listeners
    this.prevButton?.removeEventListener('click', this.previous);
    this.nextButton?.removeEventListener('click', this.next);
    
    console.log('Expert Carousel destroyed');
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new ExpertCarousel('.expert-carousel-wrapper');
  
  // Store reference for potential cleanup
  window.expertCarousel = carousel;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpertCarousel;
}