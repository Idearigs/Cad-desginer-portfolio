// Configuration for development vs production
const CONFIG = {
    // Automatically detect if we're in development
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1') || window.location.hostname.includes('.local'),
    
    // Base URL configuration
    getBaseUrl: function() {
        if (this.isDevelopment) {
            return window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
        } else {
            return 'https://chamaljayaratna.com/';
        }
    },
    
    // Get full URL for a resource
    getResourceUrl: function(path) {
        // Remove leading ./ or /
        const cleanPath = path.replace(/^\.?\//, '');
        return this.getBaseUrl() + cleanPath;
    }
};

// Debug logging
console.log('🔧 Config loaded:');
console.log('  - Development mode:', CONFIG.isDevelopment);
console.log('  - Base URL:', CONFIG.getBaseUrl());
console.log('  - Current hostname:', window.location.hostname);
console.log('  - Full URL:', window.location.href);