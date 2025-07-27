// Gallery Page JavaScript

// Gallery state
let currentFilter = 'all';
let currentModalIndex = 0;
let visibleItems = [];
let allGalleryItems = [];

// Initialize gallery
document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
    setupKeyboardNavigation();
});

async function initializeGallery() {
    // Show loading state
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        galleryGrid.innerHTML = '<div class="loading-message" style="text-align: center; padding: 40px;"><p>Loading gallery items...</p></div>';
    }
    
    try {
        // Fetch gallery items from API
        await window.galleryAPI.fetchGalleryImages();
        
        // Render gallery items
        if (galleryGrid) {
            window.galleryAPI.renderGalleryItems(galleryGrid);
        }
        
        // Update gallery state
        allGalleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        updateVisibleItems();
        animateGalleryItems();
    } catch (error) {
        console.error('Failed to initialize gallery:', error);
        
        // Show error message
        if (galleryGrid) {
            galleryGrid.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Failed to load gallery items. Please try again later.</p></div>';
        }
    }
}

function updateVisibleItems() {
    visibleItems = allGalleryItems.filter(item => {
        if (currentFilter === 'all') {
            return !item.classList.contains('hidden');
        }
        return item.dataset.category === currentFilter && !item.classList.contains('hidden');
    });
}

function animateGalleryItems() {
    // Stagger animation for gallery items
    const items = document.querySelectorAll('.gallery-item:not(.hidden)');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

// Filter Functions
function filterGallery(category) {
    currentFilter = category;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter gallery items
    const galleryGrid = document.getElementById('galleryGrid');
    const items = galleryGrid.querySelectorAll('.gallery-item');
    
    items.forEach((item, index) => {
        const itemCategory = item.dataset.category;
        
        if (category === 'all' || itemCategory === category) {
            item.style.animation = 'none';
            item.offsetHeight; // Trigger reflow
            item.style.animation = `fadeInUp 0.6s ease-out ${index * 0.05}s both`;
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    
    updateVisibleItems();
    
    // Show/hide load more button
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const visibleCount = items.length - document.querySelectorAll('.gallery-item.hidden').length;
    
    if (visibleCount < 20 && category !== 'all') {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Modal Functions
function openModal(galleryItem) {
    const modal = document.getElementById('galleryModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalCategory = document.getElementById('modalCategory');
    
    // Get data from gallery item
    const img = galleryItem.querySelector('img');
    const info = galleryItem.querySelector('.gallery-info');
    const title = info.querySelector('h3').textContent;
    const description = info.querySelector('p').textContent;
    const category = info.querySelector('.category').textContent;
    
    // Set modal content
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalCategory.textContent = category;
    
    // Set current modal index
    updateVisibleItems();
    currentModalIndex = visibleItems.indexOf(galleryItem);
    
    // Generate additional details
    setModalDetails(category);
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    modal.focus();
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('modal-close')) {
        return;
    }
    
    const modal = document.getElementById('galleryModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'unset';
}

function setModalDetails(category) {
    const modalType = document.getElementById('modalType');
    const modalDate = document.getElementById('modalDate');
    const modalClient = document.getElementById('modalClient');
    const modalTools = document.getElementById('modalTools');
    
    // Generate realistic details based on category
    const details = getProjectDetails(category);
    
    modalType.textContent = details.type;
    modalDate.textContent = details.date;
    modalClient.textContent = details.client;
    modalTools.textContent = details.tools;
}

function getProjectDetails(category) {
    const detailsMap = {
        automotive: {
            type: 'Automotive CAD Design',
            date: '2024',
            client: 'Automotive OEM',
            tools: 'SolidWorks, AutoCAD, CATIA, KeyShot'
        },
        aerospace: {
            type: 'Aerospace Engineering',
            date: '2023-2024',
            client: 'Defense Contractor',
            tools: 'CATIA V5, NX, ANSYS, KeyShot'
        },
        medical: {
            type: 'Medical Device Design',
            date: '2024',
            client: 'Medical Technology Company',
            tools: 'SolidWorks, Fusion 360, FDA Compliance'
        },
        industrial: {
            type: 'Industrial Machinery',
            date: '2023',
            client: 'Manufacturing Company',
            tools: 'Inventor, SolidWorks, AutoCAD'
        },
        electronics: {
            type: 'Electronic Housing Design',
            date: '2024',
            client: 'Consumer Electronics',
            tools: 'Fusion 360, Rhino, KeyShot, Altium'
        }
    };
    
    return detailsMap[category] || detailsMap.industrial;
}

// Modal Navigation
function nextImage() {
    if (currentModalIndex < visibleItems.length - 1) {
        currentModalIndex++;
    } else {
        currentModalIndex = 0;
    }
    updateModalContent();
}

function previousImage() {
    if (currentModalIndex > 0) {
        currentModalIndex--;
    } else {
        currentModalIndex = visibleItems.length - 1;
    }
    updateModalContent();
}

function updateModalContent() {
    const currentItem = visibleItems[currentModalIndex];
    if (currentItem) {
        const img = currentItem.querySelector('img');
        const info = currentItem.querySelector('.gallery-info');
        const title = info.querySelector('h3').textContent;
        const description = info.querySelector('p').textContent;
        const category = info.querySelector('.category').textContent;
        
        // Update modal content with animation
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalCategory = document.getElementById('modalCategory');
        
        // Fade out
        modalImage.style.opacity = '0';
        
        setTimeout(() => {
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            modalCategory.textContent = category;
            
            setModalDetails(currentItem.dataset.category);
            
            // Fade in
            modalImage.style.opacity = '1';
        }, 200);
    }
}

// Keyboard Navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('galleryModal');
        
        if (modal.classList.contains('active')) {
            switch(e.key) {
                case 'Escape':
                    closeModal();
                    break;
                case 'ArrowLeft':
                    previousImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        }
        
        // Filter shortcuts
        if (!modal.classList.contains('active')) {
            switch(e.key) {
                case '1':
                    filterGallery('all');
                    break;
                case '2':
                    filterGallery('automotive');
                    break;
                case '3':
                    filterGallery('aerospace');
                    break;
                case '4':
                    filterGallery('medical');
                    break;
                case '5':
                    filterGallery('industrial');
                    break;
                case '6':
                    filterGallery('electronics');
                    break;
            }
        }
    });
}

// Load More Functionality
function loadMoreImages() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;
    
    // Simulate loading delay
    setTimeout(() => {
        // Generate additional gallery items
        const galleryGrid = document.getElementById('galleryGrid');
        const additionalItems = generateAdditionalItems(6);
        
        additionalItems.forEach((itemHTML, index) => {
            const div = document.createElement('div');
            div.innerHTML = itemHTML;
            const newItem = div.firstElementChild;
            
            // Add to gallery with stagger animation
            setTimeout(() => {
                galleryGrid.appendChild(newItem);
                newItem.style.animation = `fadeInUp 0.6s ease-out both`;
            }, index * 100);
        });
        
        // Update gallery state
        allGalleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        updateVisibleItems();
        
        // Reset button
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.disabled = false;
        
        // Hide button if we've loaded enough
        if (allGalleryItems.length >= 30) {
            loadMoreBtn.style.display = 'none';
        }
        
        showToast('Success', 'More images loaded successfully!');
    }, 1500);
}

function generateAdditionalItems(count) {
    const categories = ['automotive', 'aerospace', 'medical', 'industrial', 'electronics'];
    const items = [];
    
    const projectTemplates = {
        automotive: [
            {title: 'Suspension System', desc: 'Advanced MacPherson Strut', img: 'photo-1603584173870-7f23fdae1b7a'},
            {title: 'Fuel Injection System', desc: 'Direct Injection Design', img: 'photo-1572312284222-ecf6d5b3b1b5'}
        ],
        aerospace: [
            {title: 'Landing Gear', desc: 'Retractable Gear System', img: 'photo-1581833971358-2c8b550f87b3'},
            {title: 'Avionics Housing', desc: 'Flight Control Module', img: 'photo-1614730321146-b6fa6a46bcb4'}
        ],
        medical: [
            {title: 'Surgical Tool', desc: 'Minimally Invasive Design', img: 'photo-1576091160399-112ba8d25d1f'},
            {title: 'Diagnostic Device', desc: 'Portable Scanner Housing', img: 'photo-1559757175-0eb30cd8c063'}
        ],
        industrial: [
            {title: 'Conveyor System', desc: 'Automated Transport Belt', img: 'photo-1565793298595-6a879b1d9492'},
            {title: 'Pneumatic Actuator', desc: 'High-Pressure Cylinder', img: 'photo-1581092918484-8313b88b2b81'}
        ],
        electronics: [
            {title: 'Smartphone Housing', desc: 'Ergonomic Design', img: 'photo-1511707171634-5f897ff02aa9'},
            {title: 'Server Chassis', desc: 'Rack-Mount Design', img: 'photo-1558494949-ef010cbdcc31'}
        ]
    };
    
    for (let i = 0; i < count; i++) {
        const category = categories[i % categories.length];
        const templates = projectTemplates[category];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        items.push(`
            <div class="gallery-item" data-category="${category}" onclick="openModal(this)">
                <div class="gallery-image">
                    <img src="https://images.unsplash.com/${template.img}?auto=format&fit=crop&w=600&h=600" alt="${template.title}">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h3>${template.title}</h3>
                            <p>${template.desc}</p>
                            <span class="category">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
    
    return items;
}

// Touch/Swipe Support for Mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    const modal = document.getElementById('galleryModal');
    if (modal.classList.contains('active')) {
        touchStartX = e.changedTouches[0].screenX;
    }
});

document.addEventListener('touchend', function(e) {
    const modal = document.getElementById('galleryModal');
    if (modal.classList.contains('active')) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }
});

function handleSwipeGesture() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe right - previous image
            previousImage();
        } else {
            // Swipe left - next image
            nextImage();
        }
    }
}

// Search functionality (can be added later)
function searchGallery(query) {
    const items = document.querySelectorAll('.gallery-item');
    const searchQuery = query.toLowerCase();
    
    items.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const description = item.querySelector('p').textContent.toLowerCase();
        const category = item.dataset.category.toLowerCase();
        
        if (title.includes(searchQuery) || description.includes(searchQuery) || category.includes(searchQuery)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    
    updateVisibleItems();
}

// Export functions for global access
window.galleryUtils = {
    filterGallery,
    openModal,
    closeModal,
    nextImage,
    previousImage,
    loadMoreImages,
    searchGallery
};