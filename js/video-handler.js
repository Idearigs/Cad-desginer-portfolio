/**
 * Professional Unified Hero Video Handler
 * Handles both desktop and mobile MP4 videos with comprehensive diagnostics
 */

class HeroVideoHandler {
    constructor() {
        this.desktopVideo = null;
        this.mobileVideo = null;
        this.activeVideo = null;
        this.fallbackBg = null;
        this.isMobile = window.innerWidth <= 768;
        this.retryCount = 0;
        this.maxRetries = 2;
        
        this.init();
    }
    
    init() {
        console.log('=== HERO VIDEO HANDLER INITIALIZATION ===');
        console.log('🖥️ Device type:', this.isMobile ? 'Mobile' : 'Desktop');
        console.log('📐 Screen width:', window.innerWidth + 'px');
        console.log('🌍 User agent:', navigator.userAgent);
        console.log('📍 Current URL:', window.location.href);
        console.log('🕐 Timestamp:', new Date().toLocaleTimeString());
        
        // Get all video elements
        this.desktopVideo = document.getElementById('heroVideoDesktop');
        this.mobileVideo = document.getElementById('heroVideoMobile');
        this.fallbackBg = document.querySelector('.hero-fallback-bg');
        
        console.log('🎬 Desktop MP4 video element found:', !!this.desktopVideo);
        console.log('📱 Mobile MP4 video element found:', !!this.mobileVideo);
        console.log('🖼️ Fallback background found:', !!this.fallbackBg);
        
        if (this.isMobile) {
            console.log('📱 Initializing MOBILE video system...');
            this.activeVideo = this.mobileVideo;
            this.initVideo('Mobile');
        } else {
            console.log('🖥️ Initializing DESKTOP video system...');
            this.activeVideo = this.desktopVideo;
            this.initVideo('Desktop');
        }
    }
    
    initVideo(deviceType) {
        console.log(`--- ${deviceType.toUpperCase()} MP4 VIDEO INITIALIZATION ---`);
        
        if (!this.activeVideo) {
            console.error(`❌ ${deviceType} MP4 video element not found!`);
            this.showFallback();
            return;
        }
        
        console.log(`✅ ${deviceType} video element found and active`);
        console.log('📂 Video element ID:', this.activeVideo.id);
        console.log('📂 Video source:', this.activeVideo.querySelector('source')?.src || 'No source found');
        
        // Check video file accessibility
        this.checkVideoFileAccessibility(deviceType);
        
        // Setup video
        this.setupVideo(deviceType);
    }
    
    async checkVideoFileAccessibility(deviceType) {
        console.log(`--- ${deviceType.toUpperCase()} VIDEO FILE ACCESSIBILITY CHECK ---`);
        
        const videoSrc = './images/video-new.mp4';
        // Use relative path for local development
        const currentPath = window.location.pathname.replace(/\/[^\/]*$/, '/');
        const basePath = window.location.origin + currentPath;
        const fullVideoURL = basePath + 'images/video-new.mp4';
        
        console.log('🌍 Current location:', window.location.href);
        console.log('📁 Checking video file:', videoSrc);
        console.log('🔗 Full video URL:', fullVideoURL);
        console.log('📂 Base path:', basePath);
        
        try {
            const startTime = performance.now();
            const response = await fetch(videoSrc, { method: 'HEAD' });
            const endTime = performance.now();
            
            console.log(`⏱️ File check took: ${(endTime - startTime).toFixed(2)}ms`);
            
            if (response.ok) {
                const contentLength = response.headers.get('content-length');
                const contentType = response.headers.get('content-type');
                const lastModified = response.headers.get('last-modified');
                const cacheControl = response.headers.get('cache-control');
                
                console.log('✅ VIDEO FILE ACCESSIBILITY CHECK PASSED ✅');
                console.log('📊 File Details:');
                console.log('  - Status:', response.status, response.statusText);
                console.log('  - File size:', contentLength ? (contentLength / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown');
                console.log('  - Content type:', contentType || 'Unknown');
                console.log('  - Last modified:', lastModified || 'Unknown');
                console.log('  - Cache control:', cacheControl || 'Not set');
                console.log('  - Server response headers available:', response.headers.keys ? 'Yes' : 'No');
                
                // Additional file info
                if (contentLength) {
                    const sizeInMB = (contentLength / 1024 / 1024).toFixed(2);
                    if (sizeInMB > 50) {
                        console.warn('⚠️ Large video file detected:', sizeInMB + 'MB - may cause slow loading');
                    } else if (sizeInMB < 1) {
                        console.warn('⚠️ Small video file detected:', sizeInMB + 'MB - verify this is the correct file');
                    } else {
                        console.log('👍 Video file size looks good:', sizeInMB + 'MB');
                    }
                }
                
            } else {
                console.error('❌ VIDEO FILE ACCESSIBILITY CHECK FAILED ❌');
                console.error('📊 Error Details:');
                console.error('  - HTTP Status:', response.status, response.statusText);
                console.error('  - This means the video.mp4 file is NOT accessible at the expected path');
                console.error('  - Full URL attempted:', fullVideoURL);
                console.error('🔧 Troubleshooting Steps:');
                console.error('  1. Verify that "video.mp4" exists in the "images/" directory');
                console.error('  2. Check file permissions (should be readable by web server)');
                console.error('  3. Ensure the file name is exactly "video.mp4" (case sensitive)');
                console.error('  4. Check if .htaccess rules are blocking video files');
                console.error('  5. Verify the web server serves .mp4 files correctly');
            }
            
        } catch (error) {
            console.error('❌ VIDEO FILE ACCESSIBILITY CHECK ERROR ❌');
            console.error('🔥 Error Details:', error.message);
            console.error('📊 Error Type:', error.name);
            console.error('🔧 Possible Causes:');
            console.error('  - Network connectivity issues');
            console.error('  - CORS restrictions on the server');
            console.error('  - Web server not responding');
            console.error('  - Incorrect file path or missing file');
            console.error('  - Firewall blocking the request');
            console.error('💡 Solutions:');
            console.error('  - Check network connection');
            console.error('  - Verify server is running and accessible');
            console.error('  - Check browser network tab for detailed error info');
        }
    }
    
    setupVideo(deviceType) {
        console.log(`--- ${deviceType.toUpperCase()} VIDEO SETUP ---`);
        
        // Log current video properties before setup
        console.log('📋 Current video element properties:');
        console.log('  - muted:', this.activeVideo.muted);
        console.log('  - autoplay:', this.activeVideo.autoplay);
        console.log('  - loop:', this.activeVideo.loop);
        console.log('  - playsinline:', this.activeVideo.playsInline);
        console.log('  - controls:', this.activeVideo.controls);
        console.log('  - preload:', this.activeVideo.preload);
        console.log('  - readyState:', this.getReadyStateText(this.activeVideo.readyState));
        
        // Ensure video properties are correct
        this.activeVideo.muted = true;
        this.activeVideo.playsInline = true;
        this.activeVideo.loop = true;
        this.activeVideo.autoplay = true;
        this.activeVideo.controls = false;
        this.activeVideo.disablePictureInPicture = true;
        
        console.log('✅ Video properties configured for', deviceType);
        
        // Set up comprehensive event listeners
        this.setupVideoEventListeners(deviceType);
        
        // Attempt to load and play
        this.loadVideo(deviceType);
    }
    
    setupVideoEventListeners(deviceType) {
        console.log(`📡 Setting up event listeners for ${deviceType} video...`);
        
        this.activeVideo.addEventListener('loadstart', () => {
            console.log(`📡 ${deviceType} video: Loading started`);
        });
        
        this.activeVideo.addEventListener('durationchange', () => {
            console.log(`⏱️ ${deviceType} video: Duration changed to`, this.activeVideo.duration, 'seconds');
        });
        
        this.activeVideo.addEventListener('loadedmetadata', () => {
            console.log(`📋 ${deviceType} video: Metadata loaded`);
            console.log('  - Duration:', this.activeVideo.duration, 'seconds');
            console.log('  - Video dimensions:', this.activeVideo.videoWidth + 'x' + this.activeVideo.videoHeight);
            console.log('  - Aspect ratio:', (this.activeVideo.videoWidth / this.activeVideo.videoHeight).toFixed(2));
        });
        
        this.activeVideo.addEventListener('loadeddata', () => this.onVideoLoaded(deviceType));
        this.activeVideo.addEventListener('canplaythrough', () => this.onVideoReady(deviceType));
        this.activeVideo.addEventListener('error', (event) => this.onVideoError(event, deviceType));
        this.activeVideo.addEventListener('stalled', () => this.onVideoStalled(deviceType));
        
        this.activeVideo.addEventListener('play', () => {
            console.log(`▶️ ${deviceType} video: Started playing`);
        });
        
        this.activeVideo.addEventListener('pause', () => {
            console.log(`⏸️ ${deviceType} video: Paused`);
        });
        
        this.activeVideo.addEventListener('waiting', () => {
            console.log(`⏳ ${deviceType} video: Buffering...`);
        });
        
        this.activeVideo.addEventListener('playing', () => {
            console.log(`🎬 ${deviceType} video: Playing smoothly`);
        });
        
        this.activeVideo.addEventListener('timeupdate', () => {
            // Only log occasionally to avoid spam
            if (Math.floor(this.activeVideo.currentTime) % 10 === 0) {
                console.log(`🕐 ${deviceType} video: Current time`, Math.floor(this.activeVideo.currentTime) + 's');
            }
        });
        
        this.activeVideo.addEventListener('ended', () => {
            console.log(`🔚 ${deviceType} video: Playback ended (should loop)`);
        });
        
        console.log(`✅ Event listeners configured for ${deviceType} video`);
    }
    
    loadVideo(deviceType) {
        try {
            console.log(`🔄 Loading ${deviceType} video...`);
            console.log('📊 Current ready state:', this.getReadyStateText(this.activeVideo.readyState));
            console.log('📊 Network state:', this.getNetworkStateText(this.activeVideo.networkState));
            
            this.activeVideo.load();
            
            // Set timeout for loading
            setTimeout(() => {
                console.log(`⏰ ${deviceType} video loading timeout check (5 seconds elapsed)...`);
                console.log('📊 Ready state after 5s:', this.getReadyStateText(this.activeVideo.readyState));
                console.log('📊 Network state after 5s:', this.getNetworkStateText(this.activeVideo.networkState));
                
                if (this.activeVideo.readyState < 2 && this.retryCount < this.maxRetries) {
                    console.log(`🔄 ${deviceType} video loading timeout, retrying... (attempt ${this.retryCount + 1}/${this.maxRetries})`);
                    this.retryCount++;
                    this.loadVideo(deviceType);
                } else if (this.activeVideo.readyState < 2) {
                    console.error(`❌ ${deviceType} video failed to load after ${this.maxRetries} retries`);
                    console.error('🔧 Final diagnostics:');
                    console.error('  - Ready state:', this.getReadyStateText(this.activeVideo.readyState));
                    console.error('  - Network state:', this.getNetworkStateText(this.activeVideo.networkState));
                    console.error('  - Current src:', this.activeVideo.currentSrc || 'None');
                    this.showFallback();
                } else {
                    console.log(`✅ ${deviceType} video loaded successfully after timeout check`);
                }
            }, 5000);
            
        } catch (error) {
            console.error(`❌ Error loading ${deviceType} video:`, error);
            console.error('Error details:', error.message);
            this.showFallback();
        }
    }
    
    getReadyStateText(readyState) {
        const states = {
            0: 'HAVE_NOTHING - No data available',
            1: 'HAVE_METADATA - Metadata loaded',
            2: 'HAVE_CURRENT_DATA - Current frame loaded',
            3: 'HAVE_FUTURE_DATA - Enough data to play forward',
            4: 'HAVE_ENOUGH_DATA - Enough data loaded'
        };
        return `${readyState}: ${states[readyState] || 'Unknown state'}`;
    }
    
    getNetworkStateText(networkState) {
        const states = {
            0: 'NETWORK_EMPTY - No data loaded',
            1: 'NETWORK_IDLE - Loading complete',
            2: 'NETWORK_LOADING - Currently loading',
            3: 'NETWORK_NO_SOURCE - No source available'
        };
        return `${networkState}: ${states[networkState] || 'Unknown state'}`;
    }
    
    onVideoLoaded(deviceType) {
        console.log(`✅ ${deviceType} video data loaded successfully`);
        console.log('📊 Final ready state:', this.getReadyStateText(this.activeVideo.readyState));
        console.log('📊 Video loaded properties:');
        console.log('  - Duration:', this.activeVideo.duration + 's');
        console.log('  - Buffered ranges:', this.activeVideo.buffered.length);
        console.log('  - Seekable ranges:', this.activeVideo.seekable.length);
        
        this.activeVideo.classList.add('loaded');
        this.hideFallback();
        this.playVideo(deviceType);
    }
    
    onVideoReady(deviceType) {
        console.log(`✅ ${deviceType} video ready to play through`);
        this.playVideo(deviceType);
    }
    
    onVideoError(event, deviceType) {
        console.error(`❌ ${deviceType} video error occurred:`, event);
        
        if (this.activeVideo.error) {
            const errorCodes = {
                1: 'MEDIA_ERR_ABORTED - Playback aborted by user',
                2: 'MEDIA_ERR_NETWORK - Network error occurred',
                3: 'MEDIA_ERR_DECODE - Decode error occurred',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Format not supported'
            };
            
            console.error(`🔥 ${deviceType} video error details:`);
            console.error('  - Error code:', this.activeVideo.error.code);
            console.error('  - Error type:', errorCodes[this.activeVideo.error.code] || 'Unknown error');
            console.error('  - Error message:', this.activeVideo.error.message || 'No message available');
            console.error('  - Current src:', this.activeVideo.currentSrc || 'No source');
            console.error('  - Ready state:', this.getReadyStateText(this.activeVideo.readyState));
            console.error('  - Network state:', this.getNetworkStateText(this.activeVideo.networkState));
        }
        
        if (this.retryCount < this.maxRetries) {
            console.log(`🔄 Retrying ${deviceType} video load... (attempt ${this.retryCount + 1}/${this.maxRetries})`);
            this.retryCount++;
            setTimeout(() => this.loadVideo(deviceType), 2000);
        } else {
            console.error(`❌ ${deviceType} video failed after all retry attempts`);
            this.showFallback();
        }
    }
    
    onVideoStalled(deviceType) {
        console.warn(`⚠️ ${deviceType} video loading stalled`);
        console.log('📊 Current buffer state:');
        const buffered = this.activeVideo.buffered;
        for (let i = 0; i < buffered.length; i++) {
            console.log(`  - Buffer range ${i}: ${buffered.start(i).toFixed(2)}s - ${buffered.end(i).toFixed(2)}s`);
        }
        
        if (this.retryCount < this.maxRetries) {
            console.log(`🔄 Retrying due to stalled loading... (attempt ${this.retryCount + 1})`);
            this.retryCount++;
            setTimeout(() => this.loadVideo(deviceType), 3000);
        }
    }
    
    async playVideo(deviceType) {
        try {
            console.log(`▶️ Attempting to play ${deviceType} video...`);
            console.log('📊 Pre-play state:');
            console.log('  - Paused:', this.activeVideo.paused);
            console.log('  - Current time:', this.activeVideo.currentTime + 's');
            console.log('  - Muted:', this.activeVideo.muted);
            console.log('  - Volume:', this.activeVideo.volume);
            
            const playPromise = this.activeVideo.play();
            await playPromise;
            
            console.log(`✅ ${deviceType} video playing successfully!`);
            console.log('🎉 Video playback started without issues');
            
        } catch (error) {
            console.log(`📊 ${deviceType} video play attempt result:`);
            console.log('  - Error name:', error.name);
            console.log('  - Error message:', error.message);
            
            if (error.name === 'NotAllowedError') {
                console.log(`ℹ️ Autoplay prevented by browser for ${deviceType} video`);
                console.log('ℹ️ This is normal behavior - video will be visible but paused');
                console.log('ℹ️ User interaction will be required to start playback');
                console.log('ℹ️ For background videos, this is usually acceptable');
            } else if (error.name === 'AbortError') {
                console.log(`ℹ️ ${deviceType} video play request was interrupted`);
                console.log('ℹ️ This can happen during rapid page interactions');
                console.log('ℹ️ Video may still function correctly');
            } else if (error.name === 'NotSupportedError') {
                console.error(`❌ ${deviceType} video format not supported by this browser`);
                console.error('🔧 Check if the video file is a valid MP4 format');
                this.showFallback();
            } else {
                console.warn(`⚠️ Unexpected ${deviceType} video play error:`, error.message);
            }
        }
    }
    
    showFallback() {
        console.log('🔄 Activating fallback background...');
        
        if (this.desktopVideo) {
            this.desktopVideo.style.opacity = '0';
            this.desktopVideo.style.display = 'none';
            console.log('🖥️ Desktop video hidden');
        }
        
        if (this.mobileVideo) {
            this.mobileVideo.style.opacity = '0';
            this.mobileVideo.style.display = 'none';
            console.log('📱 Mobile video hidden');
        }
        
        if (this.fallbackBg) {
            this.fallbackBg.style.opacity = '1';
            console.log('✅ Fallback background activated successfully');
            console.log('🎨 Users will see the gradient background instead of video');
        } else {
            console.warn('⚠️ No fallback background element found!');
            console.warn('🔧 Check if .hero-fallback-bg element exists in HTML');
        }
    }
    
    hideFallback() {
        if (this.fallbackBg) {
            this.fallbackBg.style.opacity = '0';
            console.log('✅ Fallback background hidden - video is now active');
            console.log('🎬 Users will see the video background');
        }
    }
}

// Handle window resize to switch between desktop/mobile
function handleResize() {
    const wasMobile = window.heroVideoHandler?.isMobile;
    const isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== isMobile) {
        console.log('📱⬌🖥️ SCREEN SIZE CHANGED - REINITIALIZING VIDEO HANDLER');
        console.log('📊 Transition details:');
        console.log('  - Previous mode:', wasMobile ? 'Mobile' : 'Desktop');
        console.log('  - New mode:', isMobile ? 'Mobile' : 'Desktop');
        console.log('  - Screen width:', window.innerWidth + 'px');
        console.log('  - Breakpoint: 768px');
        
        // Clean up previous handler
        if (window.heroVideoHandler) {
            console.log('🧹 Cleaning up previous video handler...');
        }
        
        // Initialize new handler
        window.heroVideoHandler = new HeroVideoHandler();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 DOM loaded - initializing unified video handler');
        console.log('📍 Initialization location: DOMContentLoaded event');
        window.heroVideoHandler = new HeroVideoHandler();
        window.addEventListener('resize', handleResize);
    });
} else {
    console.log('🚀 DOM already loaded - initializing unified video handler immediately');
    console.log('📍 Initialization location: Script execution time');
    window.heroVideoHandler = new HeroVideoHandler();
    window.addEventListener('resize', handleResize);
}