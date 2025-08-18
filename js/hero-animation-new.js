/**
 * Hero Text Animation
 * Cycles through different texts with fade animations
 */

(function() {
    'use strict';
    
    // Text array for cycling animation
    const heroTexts = [
        'PRECISION',
        'CRAFTSMANSHIP', 
        'INNOVATION',
        'ARTISTRY'
    ];
    
    let currentIndex = 0;
    const heroTitle = document.getElementById('heroTitle');
    
    function updateHeroText() {
        if (!heroTitle) return;
        
        // Add slide-out effect
        heroTitle.style.transition = 'all 0.6s ease-in-out';
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(-30px)';
        
        setTimeout(() => {
            // Update text
            heroTitle.textContent = heroTexts[currentIndex];
            
            // Reset position and fade in with slide-up effect
            heroTitle.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }, 50);
            
            // Move to next text
            currentIndex = (currentIndex + 1) % heroTexts.length;
        }, 600); // Wait for slide-out animation
    }
    
    // Initialize animation
    function initHeroAnimation() {
        if (!heroTitle) return;
        
        // Set initial text with entrance animation
        heroTitle.textContent = heroTexts[0];
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(30px)';
        heroTitle.style.transition = 'all 0.8s ease-out';
        
        // Animate in the first text
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 500);
        
        // Start cycling after 4 seconds
        setTimeout(() => {
            updateHeroText();
            // Continue cycling every 4 seconds
            setInterval(updateHeroText, 4000);
        }, 4000);
    }
    
    // Start animation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroAnimation);
    } else {
        initHeroAnimation();
    }
    
})();