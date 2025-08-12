/**
 * Video Handler for Hero Section
 * Handles YouTube embed and fallbacks
 */

(function() {
    'use strict';
    
    function initVideoHandler() {
        const heroVideo = document.querySelector('.hero-video');
        const video = heroVideo?.querySelector('.hero-background-video');
        const fallback = heroVideo?.querySelector('.hero-video-fallback');
        
        if (video) {
            console.log('Hero background video initialized');
            
            video.addEventListener('loadeddata', function() {
                console.log('Video loaded successfully');
                if (fallback) fallback.style.display = 'none';
            });
            
            video.addEventListener('error', function() {
                console.warn('Video failed to load');
                handleVideoError();
            });
            
            video.addEventListener('canplaythrough', function() {
                if (video.paused) {
                    video.play().catch(function(error) {
                        console.warn('Video autoplay failed:', error);
                        // This is okay for background videos
                    });
                }
            });
            
            // Try to load the video
            setTimeout(function() {
                if (video.readyState === 0) {
                    console.warn('Video metadata not loaded, attempting manual load');
                    video.load();
                }
            }, 2000);
            
        } else if (video) {
            // Fallback to original video handling
            video.addEventListener('error', function(e) {
                console.warn('Video failed to load:', e);
                handleVideoError();
            });
            
            video.addEventListener('loadeddata', function() {
                console.log('Video loaded successfully');
                video.style.opacity = '1';
            });
            
            video.addEventListener('canplaythrough', function() {
                if (video.paused) {
                    video.play().catch(function(error) {
                        console.warn('Video autoplay failed:', error);
                    });
                }
            });
            
            setTimeout(function() {
                if (video.readyState === 0) {
                    console.warn('Video metadata not loaded, attempting manual load');
                    video.load();
                }
            }, 2000);
        }
    }
    
    function handleVideoError() {
        const heroVideo = document.querySelector('.hero-video');
        
        if (heroVideo) {
            // Hide any video elements
            const iframe = heroVideo.querySelector('iframe');
            const video = heroVideo.querySelector('video');
            
            if (iframe) iframe.style.display = 'none';
            if (video) video.style.display = 'none';
            
            // Create a fallback background
            heroVideo.style.background = 'linear-gradient(135deg, #1a1b1d 0%, #15161a 100%)';
            heroVideo.style.backgroundSize = 'cover';
            
            console.log('Video fallback applied');
        }
    }
    
    // Helper function to check if video iframe is loaded
    function isVideoLoaded(iframe) {
        if (!iframe) return false;
        try {
            // Check if iframe has content and is not showing error
            return iframe.offsetHeight > 0 && iframe.offsetWidth > 0 && 
                   iframe.style.display !== 'none';
        } catch (e) {
            return false;
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoHandler);
    } else {
        initVideoHandler();
    }
    
})();