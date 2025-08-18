// Standard Gallery Carousel - Simple Implementation

class GalleryCarousel {
  constructor() {
    this.track = document.getElementById('carouselTrack');
    this.prevBtn = document.getElementById('prevButton');
    this.nextBtn = document.getElementById('nextButton');
    this.dotsContainer = document.getElementById('carouselDots');
    
    console.log('Carousel elements found:', {
      track: !!this.track,
      prevBtn: !!this.prevBtn,
      nextBtn: !!this.nextBtn,
      dotsContainer: !!this.dotsContainer
    });
    
    if (!this.track) {
      console.error('Carousel track not found!');
      return;
    }
    
    this.slides = this.track.querySelectorAll('.carousel-slide');
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.slidesPerView = this.getSlidesPerView();
    
    console.log(`Found ${this.totalSlides} slides, showing ${this.slidesPerView} per view`);
    
    this.init();
  }
  
  init() {
    this.createDots();
    this.setupEventListeners();
    this.updateCarousel();
    
    window.addEventListener('resize', () => {
      this.slidesPerView = this.getSlidesPerView();
      this.updateCarousel();
    });
  }
  
  getSlidesPerView() {
    const width = window.innerWidth;
    if (width >= 1200) return 3;
    if (width >= 768) return 2;
    return 1;
  }
  
  createDots() {
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
    }
    this.dots = this.dotsContainer.querySelectorAll('.dot');
  }
  
  setupEventListeners() {
    this.prevBtn.addEventListener('click', () => this.previousSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());
    
    // Touch support
    let startX = 0;
    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    this.track.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.previousSlide();
        }
      }
    });
  }
  
  nextSlide() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Loop to start
    }
    this.updateCarousel();
  }
  
  previousSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.totalSlides - 1; // Loop to end
    }
    this.updateCarousel();
  }
  
  goToSlide(index) {
    this.currentIndex = index;
    this.updateCarousel();
  }
  
  updateCarousel() {
    const slideWidth = 320; // Fixed width from CSS
    const gap = 32; // 2rem = 32px
    const translateX = -(this.currentIndex * (slideWidth + gap));
    
    console.log(`Moving to slide ${this.currentIndex}, translateX: ${translateX}px`);
    
    this.track.style.transform = `translateX(${translateX}px)`;
    
    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GalleryCarousel();
});