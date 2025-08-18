/**
 * Simple Events Handler - Guaranteed to Work with Auto-Slide
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Simple Events Handler Starting');
    
    // Global variables for auto-slide
    let currentEventIndex = 0;
    let eventsArray = [];
    let autoSlideInterval = null;
    
    // Simple function to show no events message
    function showNoEventsMessage() {
        console.log('📭 Showing no events message');
        
        const container = document.getElementById('eventsDisplayContainer');
        if (container) {
            console.log('✅ Container found, showing message');
            container.style.display = 'block';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            container.style.position = 'relative';
            container.style.width = '100%';
            container.style.maxWidth = '1000px';
            container.style.height = '400px';
            container.style.margin = '3rem auto';
            container.style.background = '#1a1a1a';
            container.style.overflow = 'hidden';
            
            container.innerHTML = `
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    z-index: 2;
                    padding: 2rem 3rem;
                ">
                    <h3 style="
                        font-family: 'Playfair Display', serif;
                        font-size: 1.8rem;
                        color: #999;
                        margin: 0 0 1rem 0;
                        font-weight: 400;
                        letter-spacing: 0.3px;
                    ">No Events Currently Available</h3>
                    <p style="
                        font-size: 1rem;
                        color: #777;
                        line-height: 1.6;
                        margin: 0;
                        font-weight: 300;
                    ">Stay tuned for upcoming exhibitions and design showcases.</p>
                </div>
            `;
            console.log('✅ No events message displayed');
        } else {
            console.error('❌ Container not found!');
        }
    }
    
    // Simple function to show event
    function showEvent(event) {
        console.log('🎯 Showing event:', event.title);
        
        const container = document.getElementById('eventsDisplayContainer');
        if (container) {
            console.log('✅ Container found, showing event');
            container.style.display = 'block';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            container.style.position = 'relative';
            container.style.width = '100%';
            container.style.maxWidth = '1000px';
            container.style.height = '400px';
            container.style.margin = '3rem auto';
            container.style.background = '#1a1a1a';
            container.style.overflow = 'hidden';
            container.style.transition = 'opacity 0.5s ease-in-out';
            
            // Get image URL
            let imageUrl = 'images/placeholder.svg';
            if (event.image_url) {
                imageUrl = event.image_url.replace(/^\/+/, '');
            } else if (event.image) {
                imageUrl = `uploads/events/${event.image}`;
            }
            
            // Format date
            let dateDisplay = '';
            if (event.date) {
                const eventDate = new Date(event.date);
                const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                                   'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const month = monthNames[eventDate.getMonth()];
                const day = eventDate.getDate();
                
                dateDisplay = `
                    <div style="
                        background: rgba(255, 255, 255, 0.95);
                        border: 2px solid rgba(255, 255, 255, 0.9);
                        border-radius: 50%;
                        width: 60px;
                        height: 60px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                        flex-shrink: 0;
                    ">
                        <span style="
                            font-size: 9px;
                            font-weight: 600;
                            letter-spacing: 1px;
                            color: #666;
                            text-transform: uppercase;
                            line-height: 1;
                        ">${month}</span>
                        <span style="
                            font-size: 20px;
                            font-weight: 700;
                            color: #1a1a1a;
                            margin: 1px 0 0 0;
                            line-height: 1;
                        ">${day}</span>
                    </div>
                `;
            }
            
            container.innerHTML = `
                <img src="${imageUrl}" alt="Event Banner" style="
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 1;
                " />
                <div style="
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    z-index: 2;
                    display: flex;
                    align-items: flex-end;
                    gap: 15px;
                ">
                    ${dateDisplay}
                    <h3 style="
                        font-family: 'Playfair Display', serif;
                        font-size: 1.5rem;
                        font-weight: 400;
                        color: white;
                        margin: 0;
                        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                        line-height: 1.2;
                        letter-spacing: 0.3px;
                    ">${event.title || 'Event'}</h3>
                </div>
            `;
            console.log('✅ Event displayed successfully');
            console.log('📊 Event details displayed:', {
                title: event.title,
                date: event.date,
                imageUrl: imageUrl
            });
        } else {
            console.error('❌ Container not found!');
        }
    }
    
    // API URL logic
    function getApiUrl() {
        const hostname = window.location.hostname;
        const origin = window.location.origin;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return origin + '/jewellery-designer/cad-art/api/events/index.php';
        }
        return origin + '/api/events/index.php';
    }
    
    // Auto-slide functionality with fade transition
    function startAutoSlide() {
        if (eventsArray.length <= 1) {
            console.log('⏸️ Auto-slide not needed - single event or no events');
            return;
        }
        
        console.log(`🔄 Starting auto-slide for ${eventsArray.length} events (3-second intervals)`);
        console.log('📋 Events to cycle through:', eventsArray.map(e => e.title));
        
        autoSlideInterval = setInterval(() => {
            currentEventIndex = (currentEventIndex + 1) % eventsArray.length;
            const nextEvent = eventsArray[currentEventIndex];
            console.log(`🔄 Auto-sliding to event ${currentEventIndex + 1}/${eventsArray.length}: "${nextEvent.title}"`);
            
            // Fade out, change content, fade in
            const container = document.getElementById('eventsDisplayContainer');
            if (container) {
                container.style.opacity = '0.3';
                setTimeout(() => {
                    showEvent(nextEvent);
                    container.style.opacity = '1';
                }, 200);
            }
        }, 3000); // 3-second intervals
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
            console.log('⏹️ Auto-slide stopped');
        }
    }
    
    // Fetch and display events
    async function loadEvents() {
        const apiUrl = getApiUrl();
        console.log('📡 Fetching events from:', apiUrl);
        
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📋 API response:', data);
            
            if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
                console.log('✅ Events found:', data.data.length);
                console.log('📋 Event titles:', data.data.map(e => e.title));
                eventsArray = data.data; // Store events for auto-slide
                currentEventIndex = 0;
                showEvent(eventsArray[0]); // Show first event
                
                // Add manual test buttons for debugging (temporary)
                addDebugButtons();
                
                startAutoSlide(); // Start auto-slide if multiple events
            } else {
                console.log('📭 No events found');
                showNoEventsMessage();
            }
        } catch (error) {
            console.error('❌ Error loading events:', error);
            showNoEventsMessage();
        }
    }
    
    // Debug function to add manual test buttons (temporary)
    function addDebugButtons() {
        if (eventsArray.length <= 1) return;
        
        const container = document.getElementById('eventsDisplayContainer');
        if (container && !document.getElementById('debug-buttons')) {
            const debugDiv = document.createElement('div');
            debugDiv.id = 'debug-buttons';
            debugDiv.style.position = 'absolute';
            debugDiv.style.top = '10px';
            debugDiv.style.right = '10px';
            debugDiv.style.zIndex = '1000';
            debugDiv.style.background = 'rgba(0,0,0,0.8)';
            debugDiv.style.padding = '10px';
            debugDiv.style.borderRadius = '5px';
            
            eventsArray.forEach((event, index) => {
                const button = document.createElement('button');
                button.textContent = `Event ${index + 1}`;
                button.style.margin = '2px';
                button.style.padding = '5px 10px';
                button.style.fontSize = '12px';
                button.style.background = '#333';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.borderRadius = '3px';
                button.style.cursor = 'pointer';
                
                button.onclick = () => {
                    console.log(`🖱️ Manual switch to event ${index + 1}: "${event.title}"`);
                    currentEventIndex = index;
                    showEvent(event);
                    stopAutoSlide();
                    startAutoSlide();
                };
                
                debugDiv.appendChild(button);
            });
            
            container.appendChild(debugDiv);
            console.log('🐛 Debug buttons added for manual testing');
        }
    }
    
    // Start the process
    console.log('🎬 Starting events load process');
    loadEvents();
    
    // Fallback: ensure something shows after 2 seconds
    setTimeout(() => {
        const container = document.getElementById('eventsDisplayContainer');
        if (container && (container.style.display === 'none' || container.style.display === '')) {
            console.log('🕐 Fallback: Showing no events message');
            showNoEventsMessage();
        }
    }, 2000);
});