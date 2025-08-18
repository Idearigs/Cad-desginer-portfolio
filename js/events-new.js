/**
 * Events Handler
 * Fetches and displays event banners from the API
 */
class EventsHandler {
    constructor() {
        this.apiUrl = this.getApiUrl();
        this.eventBannerContainer = document.getElementById('eventBanner');
        this.noEventsContainer = document.querySelector('.no-events');
        this.events = [];
        this.currentIndex = 0;
        this.autoRotateInterval = null;
    }

    /**
     * Get API URL based on environment
     */
    getApiUrl() {
        const hostname = window.location.hostname;
        const origin = window.location.origin;
        
        // Check if we're on localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return origin + '/jewellery-designer/cad-art/api/events/index.php';
        }
        
        // Production environment - use relative path
        return origin + '/api/events/index.php';
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
            this.renderNoEvents();
            return;
        }

        // Show event banner and hide no events state
        this.eventBannerContainer.style.display = 'block';
        console.log('Event banner container display set to block');
        console.log('Event banner container visibility:', window.getComputedStyle(this.eventBannerContainer).display);
        if (this.noEventsContainer) {
            this.noEventsContainer.style.display = 'none';
            console.log('No events container hidden');
        }

        // Display the first (latest) event
        this.displayEvent(0);

        // Setup auto-rotation if there are multiple events
        if (this.events.length > 1) {
            this.setupAutoRotate();
        }
    }

    /**
     * Display a specific event in the banner
     */
    displayEvent(index) {
        if (index < 0 || index >= this.events.length) return;
        
        const event = this.events[index];
        this.currentIndex = index;

        // Get elements
        const eventBannerImg = document.getElementById('eventBannerImg');
        const eventMonth = document.getElementById('eventMonth');
        const eventDay = document.getElementById('eventDay');
        const eventTitle = document.getElementById('eventTitle');

        if (!eventBannerImg || !eventMonth || !eventDay || !eventTitle) {
            console.error('Event banner elements not found');
            return;
        }

        // Set image with fallback logic
        let imageUrl = 'images/placeholder.svg';
        
        // Try different image path strategies
        if (event.image_url) {
            // Clean up the image URL path
            imageUrl = event.image_url.replace(/^\/jewellery-designer\/cad-art\//, '');
            console.log('Using image_url (cleaned):', imageUrl);
        } else if (event.image) {
            imageUrl = `uploads/events/${event.image}`;
            console.log('Using image field:', imageUrl);
        }
        
        // Fallback to awards directory if event image doesn't exist
        if (!imageUrl.includes('placeholder')) {
            console.log('Original image URL:', imageUrl);
            
            // Extract just the filename for potential fallback
            const filename = imageUrl.split('/').pop();
            console.log('Extracted filename:', filename);
            
            // If the filename contains award-related names, try awards directory
            if (filename && (filename.includes('AWARD') || filename.includes('Award') || filename.includes('JEWELLERY'))) {
                const fallbackUrl = `images/awards/${filename.replace(/^\d+_/, '')}`;
                console.log('Attempting awards directory fallback:', fallbackUrl);
            }
        }
        
        console.log('Final image URL for event banner:', imageUrl);

        eventBannerImg.src = imageUrl;
        eventBannerImg.alt = event.title || 'Event Banner';
        eventBannerImg.onerror = function() {
            console.error('Failed to load event image:', imageUrl);
            
            // Try fallback to awards directory if filename suggests it's an award
            const filename = imageUrl.split('/').pop();
            if (filename && (filename.includes('AWARD') || filename.includes('Award') || filename.includes('JEWELLERY'))) {
                const cleanFilename = filename.replace(/^\d+_/, '');
                const fallbackUrl = `images/awards/${cleanFilename}`;
                console.log('Trying awards directory fallback:', fallbackUrl);
                
                const fallbackImg = new Image();
                fallbackImg.onload = function() {
                    console.log('Awards fallback successful:', fallbackUrl);
                    eventBannerImg.src = fallbackUrl;
                };
                fallbackImg.onerror = function() {
                    console.log('Awards fallback failed, using placeholder');
                    eventBannerImg.src = 'images/placeholder.svg';
                };
                fallbackImg.src = fallbackUrl;
            } else {
                console.log('Using placeholder image');
                this.src = 'images/placeholder.svg';
            }
        };
        eventBannerImg.onload = function() {
            console.log('Event image loaded successfully:', imageUrl);
        };

        // Set date
        if (event.date) {
            const eventDate = new Date(event.date);
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                               'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            
            eventMonth.textContent = monthNames[eventDate.getMonth()];
            eventDay.textContent = eventDate.getDate();
        }

        // Set title
        eventTitle.textContent = event.title || 'Event';

        console.log('Event displayed:', {
            title: event.title,
            date: event.date,
            image: imageUrl
        });
    }

    /**
     * Add navigation controls for event banner - Now removed for automatic rotation only
     */
    addNavigationControls() {
        // Navigation controls removed as requested
        // Auto-rotation will still work
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
        this.displayEvent(index);
    }

    /**
     * Render no events state
     */
    renderNoEvents() {
        // Hide event banner and show no events state
        this.eventBannerContainer.style.display = 'none';
        if (this.noEventsContainer) {
            this.noEventsContainer.style.display = 'block';
        }
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
