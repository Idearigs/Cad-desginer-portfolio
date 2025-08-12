/**
 * Image Modal Functionality
 * Handles opening images in full screen modal
 */

(function() {
    'use strict';
    
    function initImageModal() {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const closeButton = document.getElementById('closeModal');
        
        if (!modal || !modalImage || !closeButton) {
            console.warn('Image modal elements not found');
            return;
        }
        
        // Find all clickable images
        const clickableImages = document.querySelectorAll('.news-img-container img, .image-carousel img, .single-image');
        
        // Add click event to all images
        clickableImages.forEach(img => {
            img.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(this.src, this.alt);
            });
            
            // Add visual indication that image is clickable
            img.style.cursor = 'pointer';
            img.title = 'Click to view full size';
        });
        
        // Open modal function
        function openModal(src, alt) {
            modalImage.src = src;
            modalImage.alt = alt;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Add keyboard support
            document.addEventListener('keydown', handleKeydown);
        }
        
        // Close modal function
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            modalImage.src = '';
            modalImage.alt = '';
            
            // Remove keyboard support
            document.removeEventListener('keydown', handleKeydown);
        }
        
        // Handle keyboard events
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        }
        
        // Close button event
        closeButton.addEventListener('click', closeModal);
        
        // Click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Prevent image click from closing modal
        modalImage.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        console.log('Image modal initialized with', clickableImages.length, 'clickable images');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageModal);
    } else {
        initImageModal();
    }
    
})();