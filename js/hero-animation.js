/**
 * Hero Text Animation
 * Cycles through different texts with fade animations
 */

(function() {
    'use strict';
    
    // Text array for cycling animation
    const heroTexts = [
        'PRECISION',
        'EXCELLENCE',
        'ARTISTRY',
        'INNOVATION'
    ];
    
    let currentIndex = 0;
    const heroTitle = document.getElementById('heroTitle');
    
    function updateHeroText() {
        if (!heroTitle) return;
        
        // Fade out current text
        heroTitle.style.opacity = '0';
        
        setTimeout(() => {
            // Update text
            heroTitle.textContent = heroTexts[currentIndex];
            
            // Fade in new text
            heroTitle.style.opacity = '1';
            
            // Move to next text
            currentIndex = (currentIndex + 1) % heroTexts.length;
        }, 500); // Half second delay for smooth transition
    }
    
    // Initialize animation
    function initHeroAnimation() {
        if (!heroTitle) return;
        
        // Set initial text
        heroTitle.textContent = heroTexts[0];
        heroTitle.style.opacity = '1';
        
        // Start cycling after 3 seconds
        setTimeout(() => {
            updateHeroText();
            // Continue cycling every 3 seconds
            setInterval(updateHeroText, 3000);
        }, 3000);
    }
    
    // Start animation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroAnimation);
    } else {
        initHeroAnimation();
    }
    
})();