/**
 * Professional Hero Video Handler
 * Clean, simple, and reliable video background implementation
 */

class HeroVideoHandler {
    constructor() {
        this.video = null;
        this.fallbackBg = null;
        this.isVideoSupported = true;
        this.retryCount = 0;
        this.maxRetries = 2;
        
        this.init();
    }
    
    init() {
        // Get video elements
        this.video = document.getElementById('heroVideo');
        this.fallbackBg = document.querySelector('.hero-fallback-bg');
        
        console.log('Video element found:', !!this.video);
        console.log('Fallback element found:', !!this.fallbackBg);
        console.log('Video src:', this.video?.currentSrc || this.video?.src);
        
        if (!this.video) {
            console.error('Hero video element not found!');
            this.showFallback();
            return;
        }
        
        console.log('Hero video handler initialized successfully');
        this.setupVideo();
    }
    
    setupVideo() {
        // Ensure video properties are correct
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.loop = true;
        this.video.autoplay = true;
        this.video.controls = false;
        this.video.disablePictureInPicture = true;
        
        // Set up event listeners
        this.video.addEventListener('loadeddata', this.onVideoLoaded.bind(this));
        this.video.addEventListener('canplaythrough', this.onVideoReady.bind(this));
        this.video.addEventListener('error', this.onVideoError.bind(this));
        this.video.addEventListener('stalled', this.onVideoStalled.bind(this));
        
        // Attempt to load and play
        this.loadVideo();
    }
    
    loadVideo() {
        try {
            console.log('Loading video...');\n            this.video.load();\n            \n            // Set timeout for loading\n            setTimeout(() => {\n                if (this.video.readyState < 2 && this.retryCount < this.maxRetries) {\n                    console.log('Video loading timeout, retrying...');\n                    this.retryCount++;\n                    this.loadVideo();\n                } else if (this.video.readyState < 2) {\n                    console.warn('Video failed to load after retries');\n                    this.showFallback();\n                }\n            }, 5000);\n            \n        } catch (error) {\n            console.error('Error loading video:', error);\n            this.showFallback();\n        }\n    }\n    \n    onVideoLoaded() {\n        console.log('Video data loaded successfully');\n        this.video.classList.add('loaded');\n        this.hideFallback();\n        this.playVideo();\n    }\n    \n    onVideoReady() {\n        console.log('Video ready to play');\n        this.playVideo();\n    }\n    \n    onVideoError(event) {\n        console.error('Video error:', event);\n        console.error('Video error details:', {\n            code: this.video.error?.code,\n            message: this.video.error?.message,\n            src: this.video.currentSrc\n        });\n        \n        if (this.retryCount < this.maxRetries) {\n            console.log('Retrying video load...');\n            this.retryCount++;\n            setTimeout(() => this.loadVideo(), 2000);\n        } else {\n            this.showFallback();\n        }\n    }\n    \n    onVideoStalled() {\n        console.warn('Video loading stalled');\n        if (this.retryCount < this.maxRetries) {\n            this.retryCount++;\n            setTimeout(() => this.loadVideo(), 3000);\n        }\n    }\n    \n    async playVideo() {\n        try {\n            await this.video.play();\n            console.log('Video playing successfully');\n        } catch (error) {\n            // Autoplay prevention is normal and expected\n            if (error.name === 'NotAllowedError') {\n                console.log('Autoplay prevented by browser - this is normal for background videos');\n                // Video will remain visible but paused, which is fine for background\n            } else {\n                console.warn('Video play failed:', error.message);\n            }\n        }\n    }\n    \n    showFallback() {\n        console.log('Showing video fallback background');\n        \n        if (this.video) {\n            this.video.style.opacity = '0';\n            this.video.style.display = 'none';\n        }\n        \n        if (this.fallbackBg) {\n            this.fallbackBg.style.opacity = '1';\n        }\n    }\n    \n    hideFallback() {\n        if (this.fallbackBg) {\n            this.fallbackBg.style.opacity = '0';\n        }\n    }\n}\n\n// Initialize when DOM is ready\nif (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', () => {\n        new HeroVideoHandler();\n    });\n} else {\n    new HeroVideoHandler();\n}