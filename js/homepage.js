// Homepage Specific JavaScript

// Hero Section Animation Variables
let heroCurrentIndex = 0;
let heroIsChanging = false;
let heroInterval;

const heroTexts = [
    "PRECISION",
    "INNOVATION", 
    "EXCELLENCE",
    "CRAFTSMANSHIP",
    "DETAIL"
];

const heroSubtitles = [
    "Design Excellence",
    "Creative Solutions",
    "Flawless Execution", 
    "Artisan Quality",
    "Meticulous Focus"
];

// Carousel Variables
let carouselCurrentSlide = 0;
let carouselInterval;
const carouselSlides = document.querySelectorAll('.carousel-slide');
const carouselDots = document.querySelectorAll('.dot');

// Event Banner Variables
let eventCurrentImage = 0;
let eventInterval;

// Initialize homepage functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeHeroAnimation();
    initializeCarousel();
    initializeEventBanner();
    initializeScrollAnimations();
});

// Hero Animation Functions
function initializeHeroAnimation() {
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    
    if (!heroTitle || !heroSubtitle) return;
    
    // Set initial values
    heroTitle.textContent = heroTexts[0];
    heroSubtitle.textContent = heroSubtitles[0];
    
    // Start animation after initial delay
    setTimeout(() => {
        heroInterval = setInterval(changeHeroText, 8000);
    }, 2000);
}

function changeHeroText() {
    if (heroIsChanging) return;
    
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    
    if (!heroTitle || !heroSubtitle) return;
    
    heroIsChanging = true;
    
    // Fade out
    heroTitle.classList.remove('fade-in');
    heroTitle.classList.add('fade-out');
    heroSubtitle.classList.remove('fade-in');
    heroSubtitle.classList.add('fade-out');
    
    setTimeout(() => {
        // Change text
        heroCurrentIndex = (heroCurrentIndex + 1) % heroTexts.length;
        heroTitle.textContent = heroTexts[heroCurrentIndex];
        heroSubtitle.textContent = heroSubtitles[heroCurrentIndex];
        
        // Fade in
        heroTitle.classList.remove('fade-out');
        heroTitle.classList.add('fade-in');
        heroSubtitle.classList.remove('fade-out');
        heroSubtitle.classList.add('fade-in');
        
        setTimeout(() => {
            heroIsChanging = false;
        }, 3000);
    }, 3000);
}

// Carousel Functions
function initializeCarousel() {
    if (carouselSlides.length === 0) return;
    
    // Set first slide as active
    showCarouselSlide(0);
    
    // Start auto-play
    carouselInterval = setInterval(nextSlide, 6000);
    
    // Pause on hover
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', () => {
            clearInterval(carouselInterval);
        });
        
        carouselWrapper.addEventListener('mouseleave', () => {
            carouselInterval = setInterval(nextSlide, 6000);
        });
    }
}

function showCarouselSlide(index) {
    // Remove active class from all slides and dots
    carouselSlides.forEach((slide, i) => {
        slide.classList.remove('active', 'prev');
        if (i < index) {
            slide.classList.add('prev');
        }
    });
    
    carouselDots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Add active class to current slide and dot
    if (carouselSlides[index]) {
        carouselSlides[index].classList.add('active');
    }
    if (carouselDots[index]) {
        carouselDots[index].classList.add('active');
    }
    
    carouselCurrentSlide = index;
}

function nextSlide() {
    const nextIndex = (carouselCurrentSlide + 1) % carouselSlides.length;
    showCarouselSlide(nextIndex);
}

function prevSlide() {
    const prevIndex = (carouselCurrentSlide - 1 + carouselSlides.length) % carouselSlides.length;
    showCarouselSlide(prevIndex);
}

function currentSlide(index) {
    showCarouselSlide(index - 1); // Convert from 1-based to 0-based index
}

// Event Banner Functions
function initializeEventBanner() {
    const eventImages = document.querySelectorAll('.event-image');
    
    if (eventImages.length === 0) return;
    
    // Set first image as active
    eventImages[0].classList.add('active');
    
    // Start auto-change
    eventInterval = setInterval(() => {
        eventImages[eventCurrentImage].classList.remove('active');
        eventCurrentImage = (eventCurrentImage + 1) % eventImages.length;
        eventImages[eventCurrentImage].classList.add('active');
    }, 3000);
}

// Scroll Animations
function initializeScrollAnimations() {
    // Create intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.8s ease-out forwards';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.icon-project, .work-item, .summer-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Project click handlers
function handleProjectClick(projectId) {
    window.location.href = `project-details.html?id=${projectId}`;
}

// Work item hover effects
document.addEventListener('DOMContentLoaded', function() {
    const workItems = document.querySelectorAll('.work-item, .summer-item, .icon-project');
    
    workItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Smooth scroll for internal links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        scrollToSection(targetId);
    }
});

// Cleanup functions
function cleanupHomepage() {
    if (heroInterval) clearInterval(heroInterval);
    if (carouselInterval) clearInterval(carouselInterval);
    if (eventInterval) clearInterval(eventInterval);
}

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause animations
        if (carouselInterval) clearInterval(carouselInterval);
        if (eventInterval) clearInterval(eventInterval);
        if (heroInterval) clearInterval(heroInterval);
    } else {
        // Page is visible, resume animations
        if (carouselSlides.length > 0) {
            carouselInterval = setInterval(nextSlide, 6000);
        }
        
        const eventImages = document.querySelectorAll('.event-image');
        if (eventImages.length > 0) {
            eventInterval = setInterval(() => {
                eventImages[eventCurrentImage].classList.remove('active');
                eventCurrentImage = (eventCurrentImage + 1) % eventImages.length;
                eventImages[eventCurrentImage].classList.add('active');
            }, 3000);
        }
        
        if (heroTexts.length > 0) {
            heroInterval = setInterval(changeHeroText, 8000);
        }
    }
});

// Export functions for global access
window.homepageUtils = {
    nextSlide,
    prevSlide,
    currentSlide,
    handleProjectClick,
    cleanupHomepage
};