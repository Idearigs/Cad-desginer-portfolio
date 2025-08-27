/**
 * Simple Video Handler for Hero Section
 * Handles video loading with fallback
 */

(function() {
    'use strict';
    
    function initHeroVideo() {
        const video = document.querySelector('.hero-video');
        
        if (!video) {
            console.log('No hero video element found');
            return;
        }
        
        console.log('Initializing hero video...');
        console.log('Video src:', video.querySelector('source')?.src);
        
        // Ensure video properties are set
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.autoplay = true;
        
        // Add event listeners for debugging
        video.addEventListener('loadstart', () => {
            console.log('Video: Load started');
        });
        
        video.addEventListener('loadedmetadata', () => {
            console.log('Video: Metadata loaded - Duration:', video.duration + 's');
        });
        
        video.addEventListener('loadeddata', () => {
            console.log('Video: Data loaded');
            video.style.opacity = '1';
        });
        
        video.addEventListener('canplay', () => {
            console.log('Video: Can play');
        });
        
        video.addEventListener('playing', () => {
            console.log('Video: Playing successfully');
        });
        
        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            if (video.error) {
                console.error('Error details:', video.error.code, video.error.message);
            }
            showFallback();
        });
        
        video.addEventListener('stalled', () => {
            console.warn('Video loading stalled');
        });
        
        // Set initial opacity to 0 and fade in when loaded
        video.style.opacity = '0';
        video.style.transition = 'opacity 1s ease-in-out';
        
        // Force load the video
        video.load();
        
        // Fallback after timeout
        setTimeout(() => {
            if (video.readyState < 2) {
                console.warn('Video failed to load within 10 seconds, showing fallback');
                showFallback();
            }
        }, 10000);
        
        function showFallback() {
            console.log('Showing fallback background');
            video.style.display = 'none';
            
            // Create a fallback background if it doesn't exist
            const heroBackground = document.querySelector('.hero-background');
            if (heroBackground) {
                heroBackground.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroVideo);
    } else {
        initHeroVideo();
    }
})();