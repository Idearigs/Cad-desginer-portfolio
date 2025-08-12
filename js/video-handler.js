/**
 * Video Handler for Hero Section
 * Handles video loading, errors, and fallbacks
 */

(function() {
    'use strict';
    
    function initVideoHandler() {
        const video = document.querySelector('.hero-video video');
        if (!video) return;
        
        // Add error handling
        video.addEventListener('error', function(e) {
            console.warn('Video failed to load:', e);
            handleVideoError();
        });
        
        // Add load event to ensure video is ready
        video.addEventListener('loadeddata', function() {
            console.log('Video loaded successfully');
            video.style.opacity = '1';
        });
        
        // Try to force video load if it doesn't start automatically
        video.addEventListener('canplaythrough', function() {
            if (video.paused) {
                video.play().catch(function(error) {
                    console.warn('Video autoplay failed:', error);
                    // Autoplay failed, but that's okay for background videos
                });
            }
        });
        
        // Handle case where video metadata doesn't load
        setTimeout(function() {
            if (video.readyState === 0) {
                console.warn('Video metadata not loaded, attempting manual load');
                video.load();
            }
        }, 2000);
    }
    
    function handleVideoError() {
        const heroVideo = document.querySelector('.hero-video');
        const video = heroVideo.querySelector('video');
        
        if (heroVideo && video) {
            // Hide the video element
            video.style.display = 'none';
            
            // Create a fallback background
            heroVideo.style.background = 'linear-gradient(135deg, #1a1b1d 0%, #15161a 100%)';
            heroVideo.style.backgroundSize = 'cover';
            
            console.log('Video fallback applied');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoHandler);
    } else {
        initVideoHandler();
    }
    
})();