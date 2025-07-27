/**
 * Events Handler
 * Fetches and displays event banners from the API
 */
class EventsHandler {
    constructor() {
        this.apiUrl = 'api/events/index.php';
        this.eventBannerContainer = document.querySelector('.event-banner');
        this.events = [];
        this.currentIndex = 0;
        this.autoRotateInterval = null;
    }

    /**
     * Initialize the events handler
     */
    async init() {
        try {
            await this.fetchEvents();
            this.renderEvents();
            this.setupAutoRotate();
        } catch (error) {
            console.error('Failed to initialize events:', error);
            this.renderFallbackEvent();
        }
    }

    /**
     * Fetch events from the API
     */
    async fetchEvents() {
        try {
            console.log('Fetching events from API...');
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && Array.isArray(data.data)) {
                this.events = data.data;
                console.log('Events fetched successfully:', this.events);
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    /**
     * Render events in the event banner container
     */
    renderEvents() {
        if (!this.eventBannerContainer) {
            console.error('Event banner container not found');
            return;
        }

        if (this.events.length === 0) {
            this.renderFallbackEvent();
            return;
        }

        // Clear existing content
        this.eventBannerContainer.innerHTML = '';

        // Create event slides
        this.events.forEach((event, index) => {
            const imageUrl = event.image_url || (event.image ? `uploads/${event.image}` : 'images/placeholder.svg');
            const isActive = index === 0;
            
            const eventSlide = document.createElement('div');
            eventSlide.className = `event-image ${isActive ? 'active' : ''}`;
            eventSlide.dataset.index = index;
            
            eventSlide.innerHTML = `
                <img src="${imageUrl}" alt="${this.escapeHtml(event.title)}" 
                     onerror="this.onerror=null; this.src='images/placeholder.svg'; this.style.objectFit='contain';">
                <div class="event-details">
                    <h3>${this.escapeHtml(event.title)}</h3>
                    ${event.date ? `<p class="event-date">${this.formatDate(event.date)}</p>` : ''}
                    ${event.location ? `<p class="event-location">${this.escapeHtml(event.location)}</p>` : ''}
                </div>
            `;
            
            this.eventBannerContainer.appendChild(eventSlide);
        });

        // Add navigation controls if there are multiple events
        if (this.events.length > 1) {
            this.addNavigationControls();
        }
    }

    /**
     * Add navigation controls for event banner
     */
    addNavigationControls() {
        const navControls = document.createElement('div');
        navControls.className = 'event-navigation';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'event-nav prev';
        prevBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
            </svg>
        `;
        prevBtn.addEventListener('click', () => this.navigateEvent('prev'));
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'event-nav next';
        nextBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
            </svg>
        `;
        nextBtn.addEventListener('click', () => this.navigateEvent('next'));
        
        // Indicators
        const indicators = document.createElement('div');
        indicators.className = 'event-indicators';
        
        this.events.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `event-indicator ${index === 0 ? 'active' : ''}`;
            indicator.dataset.index = index;
            indicator.addEventListener('click', () => this.goToEvent(index));
            indicators.appendChild(indicator);
        });
        
        navControls.appendChild(prevBtn);
        navControls.appendChild(indicators);
        navControls.appendChild(nextBtn);
        
        this.eventBannerContainer.appendChild(navControls);
    }

    /**
     * Navigate to previous or next event
     * @param {string} direction - 'prev' or 'next'
     */
    navigateEvent(direction) {
        // Reset auto-rotate timer
        this.resetAutoRotate();
        
        let newIndex;
        if (direction === 'prev') {
            newIndex = (this.currentIndex - 1 + this.events.length) % this.events.length;
        } else {
            newIndex = (this.currentIndex + 1) % this.events.length;
        }
        
        this.goToEvent(newIndex);
    }

    /**
     * Go to a specific event by index
     * @param {number} index - The index of the event to show
     */
    goToEvent(index) {
        if (index < 0 || index >= this.events.length) return;
        
        // Update current index
        this.currentIndex = index;
        
        // Update active classes on slides
        const slides = this.eventBannerContainer.querySelectorAll('.event-image');
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update indicators
        const indicators = this.eventBannerContainer.querySelectorAll('.event-indicator');
        indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    /**
     * Setup auto-rotation for events
     */
    setupAutoRotate() {
        if (this.events.length <= 1) return;
        
        this.autoRotateInterval = setInterval(() => {
            this.navigateEvent('next');
        }, 5000); // Rotate every 5 seconds
    }

    /**
     * Reset auto-rotation timer
     */
    resetAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.setupAutoRotate();
        }
    }

    /**
     * Render a fallback event if no events are available
     */
    renderFallbackEvent() {
        if (!this.eventBannerContainer) return;
        
        this.eventBannerContainer.innerHTML = `
            <div class="event-image active">
                <img src="images/placeholder.svg" alt="No events available" 
                     onerror="this.style.display='none';">
                <div class="event-details">
                    <h3>No Events Currently Scheduled</h3>
                    <p>Check back soon for upcoming events</p>
                </div>
            </div>
        `;
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string in YYYY-MM-DD format
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} unsafe - Unsafe string
     * @returns {string} Escaped string
     */
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize events handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const eventsHandler = new EventsHandler();
    eventsHandler.init();
});
