/**
 * Fresh Events Handler - Clean and Simple
 */
class EventsHandler {
    constructor() {
        console.log('🎯 FRESH EVENTS HANDLER STARTING');
        this.apiUrl = this.getApiUrl();
        this.eventBannerContainer = document.getElementById('eventBanner');
        this.noEventsContainer = document.querySelector('.no-events');
        this.events = [];
        this.currentIndex = 0;
        this.autoRotateInterval = null;
        
        console.log('🌐 API URL:', this.apiUrl);
        console.log('📦 Event banner container found:', !!this.eventBannerContainer);
        console.log('📦 No events container found:', !!this.noEventsContainer);
    }

    getApiUrl() {
        const hostname = window.location.hostname;
        const origin = window.location.origin;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return origin + '/jewellery-designer/cad-art/api/events/index.php';
        }
        return origin + '/api/events/index.php';
    }

    async init() {
        console.log('🚀 INITIALIZING FRESH EVENTS HANDLER');
        try {
            await this.fetchEvents();
            this.renderEvents();
        } catch (error) {
            console.error('❌ Failed to initialize events:', error);
            this.showNoEvents();
        }
    }

    async fetchEvents() {
        console.log('📡 Fetching events from API:', this.apiUrl);
        const response = await fetch(this.apiUrl);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 API response:', data);
        
        if (data.status === 'success' && Array.isArray(data.data)) {
            this.events = data.data;
            console.log('✅ Events loaded:', this.events.length);
        } else {
            throw new Error('Invalid API response');
        }
    }

    renderEvents() {
        console.log('🎨 RENDERING EVENTS');
        
        if (this.events.length === 0) {
            console.log('📭 No events to display');
            this.showNoEvents();
            return;
        }

        // Show event banner
        this.showEventBanner();
        
        // Display first event
        this.displayEvent(0);
        
        // Setup auto-rotation for multiple events
        if (this.events.length > 1) {
            this.setupAutoRotate();
            this.addEventIndicators();
        }
    }

    showEventBanner() {
        if (!this.eventBannerContainer) return;
        
        // Hide no events section
        if (this.noEventsContainer) {
            this.noEventsContainer.style.display = 'none';
        }
        
        // Show event banner
        this.eventBannerContainer.style.display = 'block';
        this.eventBannerContainer.classList.add('reveal-in');
        
        console.log('✅ Event banner shown');
    }

    displayEvent(index) {
        if (index < 0 || index >= this.events.length) return;
        
        const event = this.events[index];
        this.currentIndex = index;
        
        console.log('🎯 Displaying event:', event.title);

        // Create or get image element
        let eventImg = document.getElementById('eventBannerImg');
        if (!eventImg) {
            eventImg = document.createElement('img');
            eventImg.id = 'eventBannerImg';
            eventImg.className = 'event-image';
            eventImg.alt = 'Event Banner';
            this.eventBannerContainer.appendChild(eventImg);
        }

        // Set image
        let imageUrl = 'images/placeholder.svg';
        if (event.image_url) {
            imageUrl = event.image_url.replace(/^\/+/, '');
        } else if (event.image) {
            imageUrl = `uploads/events/${event.image}`;
        }
        
        eventImg.src = imageUrl;
        console.log('🖼️ Image set:', imageUrl);

        // Create or update date circle and title
        this.createEventContent(event);
        
        // Update indicators
        this.updateEventIndicators();
    }

    createEventContent(event) {
        // Get or create hidden event data container
        let hiddenData = this.eventBannerContainer.querySelector('.hidden-event-data');
        if (!hiddenData) {
            hiddenData = document.createElement('div');
            hiddenData.className = 'hidden-event-data';
            this.eventBannerContainer.appendChild(hiddenData);
        }

        // Create date circle
        let dateCircle = hiddenData.querySelector('.event-date-circle');
        if (!dateCircle) {
            dateCircle = document.createElement('div');
            dateCircle.className = 'event-date-circle';
            hiddenData.appendChild(dateCircle);
        }

        // Create month span
        let monthSpan = dateCircle.querySelector('#eventMonth');
        if (!monthSpan) {
            monthSpan = document.createElement('span');
            monthSpan.id = 'eventMonth';
            dateCircle.appendChild(monthSpan);
        }

        // Create day span
        let daySpan = dateCircle.querySelector('#eventDay');
        if (!daySpan) {
            daySpan = document.createElement('span');
            daySpan.id = 'eventDay';
            dateCircle.appendChild(daySpan);
        }

        // Create title
        let titleElement = hiddenData.querySelector('#eventTitle');
        if (!titleElement) {
            titleElement = document.createElement('h3');
            titleElement.id = 'eventTitle';
            hiddenData.appendChild(titleElement);
        }

        // Set date
        if (event.date) {
            const eventDate = new Date(event.date);
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                               'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            
            monthSpan.textContent = monthNames[eventDate.getMonth()];
            daySpan.textContent = eventDate.getDate();
        }

        // Set title
        titleElement.textContent = event.title || 'Event';
        
        console.log('✅ Event content created');
    }

    addEventIndicators() {
        if (this.events.length <= 1) return;
        
        // Add event counter
        let counter = this.eventBannerContainer.querySelector('.event-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'event-counter';
            this.eventBannerContainer.appendChild(counter);
        }
        
        // Add indicators container
        let indicatorsContainer = this.eventBannerContainer.querySelector('.event-indicators');
        if (!indicatorsContainer) {
            indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'event-indicators';
            this.eventBannerContainer.appendChild(indicatorsContainer);
        }
        
        // Clear and create indicators
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < this.events.length; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'event-indicator';
            if (i === 0) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                this.goToEvent(i);
                this.resetAutoRotate();
            });
            
            indicatorsContainer.appendChild(indicator);
        }
        
        console.log('📊 Added indicators for', this.events.length, 'events');
    }

    updateEventIndicators() {
        const counter = this.eventBannerContainer?.querySelector('.event-counter');
        const indicators = this.eventBannerContainer?.querySelectorAll('.event-indicator');
        
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} of ${this.events.length}`;
        }
        
        indicators?.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    goToEvent(index) {
        if (index >= 0 && index < this.events.length) {
            this.displayEvent(index);
        }
    }

    setupAutoRotate() {
        if (this.events.length <= 1) return;
        
        this.autoRotateInterval = setInterval(() => {
            const nextIndex = (this.currentIndex + 1) % this.events.length;
            this.goToEvent(nextIndex);
        }, 8000); // 8 seconds
        
        console.log('🔄 Auto-rotation setup for', this.events.length, 'events');
    }

    resetAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.setupAutoRotate();
        }
    }

    showNoEvents() {
        console.log('📭 SHOWING NO EVENTS STATE');
        
        // Hide event banner completely
        if (this.eventBannerContainer) {
            this.eventBannerContainer.style.display = 'none';
            this.eventBannerContainer.innerHTML = ''; // Clear all content
        }
        
        // Show no events message
        if (this.noEventsContainer) {
            this.noEventsContainer.style.display = 'block';
            
            const noEventsContent = this.noEventsContainer.querySelector('.no-events-content');
            if (noEventsContent) {
                noEventsContent.innerHTML = `
                    <h3>No Events Currently Available</h3>
                    <p>Stay tuned for upcoming exhibitions and design showcases.</p>
                `;
            }
        }
        
        console.log('✅ No events state displayed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM LOADED - INITIALIZING FRESH EVENTS HANDLER');
    const eventsHandler = new EventsHandler();
    eventsHandler.init();
});