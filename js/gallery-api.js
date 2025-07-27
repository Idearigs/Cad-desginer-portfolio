// Gallery API Integration

class GalleryAPI {
    constructor() {
        this.apiUrl = 'api/gallery/index.php';
        this.galleryItems = [];
        this.categories = [];
    }

    // Fetch all gallery images from the API
    async fetchGalleryImages(category = null) {
        try {
            let url = this.apiUrl;
            if (category && category !== 'all') {
                url += `?category=${encodeURIComponent(category)}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success' && Array.isArray(result.data)) {
                this.galleryItems = result.data;
                return this.galleryItems;
            } else {
                console.warn('API returned unexpected format');
                return [];
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            return [];
        }
    }

    // Fetch all available categories
    async fetchCategories() {
        try {
            const response = await fetch(`${this.apiUrl}?action=categories`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success' && Array.isArray(result.data)) {
                this.categories = result.data;
                return this.categories;
            } else {
                console.warn('API returned unexpected format for categories');
                return [];
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Render gallery items to the gallery grid
    renderGalleryItems(container) {
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        if (this.galleryItems.length === 0) {
            container.innerHTML = '<div class="empty-gallery">No gallery items found</div>';
            return;
        }
        
        // Render each gallery item
        this.galleryItems.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.category = item.category || 'uncategorized';
            galleryItem.onclick = () => window.galleryUtils.openModal(galleryItem);
            
            const imageUrl = item.image_url || 'images/placeholder.svg';
            const title = item.title || 'Untitled';
            const description = item.description || '';
            const category = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Uncategorized';
            
            galleryItem.innerHTML = `
                <div class="gallery-image">
                    <img src="${imageUrl}" alt="${title}" onerror="this.src='images/placeholder.svg'">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h3>${title}</h3>
                            ${description ? `<p>${description}</p>` : ''}
                            <span class="category">${category}</span>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(galleryItem);
        });
        
        // Initialize gallery items for animation
        window.animateGalleryItems();
    }

    // Get demo gallery items as fallback
    getDemoGalleryItems() {
        return [
            {
                id: 1,
                title: "Automotive Engine Design",
                description: "Precision V8 Engine Block",
                category: "automotive",
                image_url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&h=600"
            },
            {
                id: 2,
                title: "Transmission System",
                description: "Advanced Gearbox Assembly",
                category: "automotive",
                image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&h=600"
            },
            {
                id: 3,
                title: "Landing Gear",
                description: "Retractable Gear System",
                category: "aerospace",
                image_url: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&w=600&h=600"
            },
            {
                id: 4,
                title: "Surgical Tool",
                description: "Minimally Invasive Design",
                category: "medical",
                image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=600&h=600"
            },
            {
                id: 5,
                title: "Smartphone Housing",
                description: "Ergonomic Design",
                category: "electronics",
                image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&h=600"
            }
        ];
    }
}

// Export the API instance
window.galleryAPI = new GalleryAPI();
