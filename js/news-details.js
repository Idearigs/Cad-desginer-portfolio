// News Details Page JavaScript

class NewsDetailsPage {
    constructor() {
        this.articleId = null;
        this.article = null;
        this.loading = true;
        this.error = null;
        
        this.init();
    }

    /**
     * Get API URL based on environment
     */
    getApiUrl() {
        const hostname = window.location.hostname;
        const origin = window.location.origin;
        
        // Check if we're on localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return origin + '/jewellery-designer/cad-art/api/news/index.php';
        }
        
        // Production environment - use relative path
        return origin + '/api/news/index.php';
    }

    init() {
        this.getArticleId();
        this.loadArticle();
        this.bindEvents();
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    getArticleId() {
        const urlParams = new URLSearchParams(window.location.search);
        this.articleId = urlParams.get('id');
        
        if (!this.articleId) {
            // Instead of showing an error, use the sample content in the HTML
            this.useSampleContent = true;
            console.log('No article ID found, using sample content');
            return;
        }
    }

    bindEvents() {
        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'news.html';
            });
        }

        // Close button
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.location.href = 'news.html';
            });
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareArticle();
            });
        }
    }

    async loadArticle() {
        // If we're using sample content, don't try to load from API
        if (this.useSampleContent) {
            // Hide loading and error states, sample content is already in the DOM
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('errorState').style.display = 'none';
            document.getElementById('articleContent').style.display = 'block';
            return;
        }
        
        if (!this.articleId) return;

        try {
            this.showLoading();
            
            // Fetch article from the API
            const apiUrl = `${this.getApiUrl()}?id=${this.articleId}`;
            console.log('Fetching article from:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API response data:', result);
            
            if (result.status === 'success' && result.data) {
                this.article = result.data;
                console.log('Article data loaded:', this.article);
                console.log('Image URL from API:', this.article.image_url);
            } else {
                // Fallback to demo data if API returns unexpected format
                console.warn('API returned unexpected format, trying demo data');
                const articles = this.getDemoArticles();
                this.article = articles.find(a => a.id == this.articleId);
                console.log('Using demo article:', this.article);
            }
            
            if (!this.article) {
                this.showError('Article not found');
                return;
            }
            
            this.renderArticle();
        } catch (error) {
            console.error('Error loading article:', error);
            
            // Try to fall back to demo data
            console.warn('Trying demo data due to API error');
            try {
                const articles = this.getDemoArticles();
                this.article = articles.find(a => a.id == this.articleId);
                
                if (this.article) {
                    console.log('Using demo article after error:', this.article);
                    this.renderArticle();
                    return;
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
            
            this.showError('Failed to load article');
        }
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'flex';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('articleContent').style.display = 'none';
    }

    showError(message) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'flex';
        document.getElementById('articleContent').style.display = 'none';
        document.getElementById('errorMessage').textContent = message;
    }

    renderArticle() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('articleContent').style.display = 'block';

        // Update page title
        document.title = `${this.article.title} - Digital CAD Atelier`;

        // Render article header
        this.renderHeader();
        
        // Render images
        this.renderImages();
        
        // Render content
        this.renderContent();
        
        // Render tags
        this.renderTags();

        // Add animations
        this.addAnimations();
    }

    renderHeader() {
        // Publication (may not exist in all templates)
        const publicationEl = document.getElementById('articlePublication');
        if (publicationEl) {
            publicationEl.textContent = this.article.publication || 'Publication not specified';
        }
        
        // Date
        const dateEl = document.getElementById('articleDate');
        if (dateEl) {
            dateEl.textContent = this.formatDate(this.article.date || this.article.created_at);
        }
        
        // Title
        const titleEl = document.getElementById('articleTitle');
        if (titleEl) {
            titleEl.textContent = this.article.title;
        }
        
        // Author
        const authorEl = document.getElementById('articleAuthor');
        if (authorEl) {
            authorEl.textContent = this.article.author ? `By ${this.article.author}` : '';
        }
    }

    renderImages() {
        const carousel = document.getElementById('imageCarousel');
        if (!carousel) {
            console.error('Image carousel element not found');
            return;
        }
        
        const images = this.getArticleImages();
        console.log('Article images:', images);
        
        if (images.length === 0) {
            carousel.style.display = 'none';
            return;
        }

        if (images.length === 1) {
            // Single image
            carousel.innerHTML = `
                <img src="${images[0]}" alt="${this.escapeHtml(this.article.title)}" class="single-image" 
                     onerror="this.onerror=null; this.src='images/placeholder.svg'; this.style.objectFit='contain'; this.style.padding='2rem';">
            `;
            console.log('Single image rendered:', images[0]);
        } else {
            // Multiple images - carousel
            const slidesHtml = images.map((image, index) => `
                <div class="carousel-slide">
                    <img src="${image}" alt="${this.escapeHtml(this.article.title)} - Image ${index + 1}" 
                         onerror="this.onerror=null; this.src='images/placeholder.svg'; this.style.objectFit='contain'; this.style.padding='2rem';">
                </div>
            `).join('');
            
            carousel.innerHTML = `
                <div class="carousel-container">
                    ${slidesHtml}
                </div>
            `;
            console.log('Multiple images carousel rendered');

            // Initialize carousel after DOM is ready
            setTimeout(() => {
                if (typeof $ !== 'undefined' && $.fn.slick) {
                    $('.carousel-container').slick({
                        dots: true,
                        infinite: true,
                        speed: 500,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: false,
                        prevArrow: '<button type="button" class="slick-prev"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></button>',
                        nextArrow: '<button type="button" class="slick-next"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg></button>'
                    });
                }
            }, 100);
        }
    }

    renderContent() {
        const bodyElement = document.getElementById('articleBody');
        if (!bodyElement) {
            console.error('Article body element not found');
            return;
        }
        
        if (!this.article.content) {
            bodyElement.innerHTML = '<p>No content available</p>';
            return;
        }

        // Split content into paragraphs and render
        const paragraphs = this.article.content.split('\n\n')
            .filter(p => p.trim().length > 0)
            .map(p => `<p>${this.escapeHtml(p.trim())}</p>`)
            .join('');
        
        bodyElement.innerHTML = paragraphs || '<p>No content available</p>';
        console.log('Article content rendered successfully');
    }

    renderTags() {
        const tagsSection = document.getElementById('articleTags');
        if (!tagsSection) {
            console.error('Article tags element not found');
            return;
        }
        
        if (!this.article.tags || !Array.isArray(this.article.tags) || this.article.tags.length === 0) {
            tagsSection.style.display = 'none';
            return;
        }

        const tagsContainer = tagsSection.querySelector('.tags-container');
        if (!tagsContainer) {
            console.error('Tags container not found');
            return;
        }
        
        tagsContainer.innerHTML = this.article.tags.map(tag => 
            `<span class="tag">${this.escapeHtml(tag)}</span>`
        ).join('');
        
        tagsSection.style.display = 'block';
        console.log('Article tags rendered:', this.article.tags);
    }

    addAnimations() {
        // Add fade-in animation to the main content
        const content = document.getElementById('articleContent');
        content.classList.add('fade-in');

        // Add staggered animations to sections
        const sections = content.querySelectorAll('.article-header, .image-carousel, .article-body, .article-tags, .share-section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                requestAnimationFrame(() => {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                });
            }, index * 100);
        });
    }

    getArticleImages() {
        const images = [];
        
        // Check for multiple images
        if (this.article.images && this.article.images.length > 0) {
            this.article.images.forEach(img => {
                const imageUrl = this.formatImageUrl(img.url);
                if (imageUrl) images.push(imageUrl);
            });
        }
        
        // Check for single image
        if (images.length === 0) {
            const singleImage = this.getSingleImageUrl();
            if (singleImage) images.push(singleImage);
        }
        
        return images;
    }

    getSingleImageUrl() {
        console.log('Getting single image URL for article:', this.article.id);
        
        if (this.article.image_url) {
            console.log('Using image_url field:', this.article.image_url);
            const formattedUrl = this.formatImageUrl(this.article.image_url);
            console.log('Formatted image_url:', formattedUrl);
            return formattedUrl;
        } else if (this.article.image) {
            console.log('Using image field:', this.article.image);
            
            if (this.article.image.startsWith('http')) {
                console.log('Image is full URL:', this.article.image);
                return this.article.image;
            } else {
                // Images are stored in uploads/articles directory
                const path = `uploads/articles/${this.article.image}`;
                console.log('Constructed path for image:', path);
                return path;
            }
        }
        
        console.log('No image found, using placeholder');
        return 'images/placeholder.svg';
    }

    formatImageUrl(url) {
        console.log('Original image URL:', url);
        
        if (!url) {
            console.log('No URL provided, using placeholder');
            return 'images/placeholder.svg';
        }
        
        if (url.startsWith('http')) {
            console.log('Using full URL:', url);
            return url;
        }
        
        // Remove leading slash if present
        if (url.startsWith('/')) {
            url = url.substring(1);
            console.log('Removed leading slash:', url);
        }
        
        // Convert backend path to frontend proxy path if needed
        if (url.includes('/digital-cad-atelier/BACKEND-PHP/uploads')) {
            const convertedUrl = url.replace('/digital-cad-atelier/BACKEND-PHP/uploads', 'uploads');
            console.log('Converted backend path:', convertedUrl);
            return convertedUrl;
        }
        
        console.log('Final image URL:', url);
        return url;
    }

    formatDate(dateString) {
        if (!dateString) return 'Date not available';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return as-is if invalid
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    shareArticle() {
        // Get current URL
        const url = window.location.href;
        const title = document.title;
        
        // Show custom share modal
        this.showShareModal(url, title);
    }
    
    showShareModal(url, title) {
        const modal = document.getElementById('shareModal');
        const shareUrlInput = document.getElementById('shareUrl');
        const copyBtn = document.getElementById('copyShareUrl');
        const closeBtn = document.getElementById('closeShareModal');
        const shareOptions = document.querySelectorAll('.share-option');
        
        // Set the URL in the input field
        shareUrlInput.value = url;
        
        // Show the modal with animation
        modal.classList.add('active');
        
        // Handle copy button click
        copyBtn.addEventListener('click', () => {
            shareUrlInput.select();
            document.execCommand('copy');
            
            // Show success state
            copyBtn.classList.add('copy-success');
            const originalText = copyBtn.querySelector('span').textContent;
            copyBtn.querySelector('span').textContent = 'Copied!';
            
            // Reset after 2 seconds
            setTimeout(() => {
                copyBtn.classList.remove('copy-success');
                copyBtn.querySelector('span').textContent = originalText;
            }, 2000);
        });
        
        // Handle close button click
        closeBtn.addEventListener('click', () => {
            this.closeShareModal();
        });
        
        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeShareModal();
            }
        });
        
        // Handle share option clicks
        shareOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = option.getAttribute('data-platform');
                this.shareOnPlatform(platform, url, title);
            });
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeShareModal();
            }
        });
    }
    
    closeShareModal() {
        const modal = document.getElementById('shareModal');
        modal.classList.remove('active');
    }
    
    shareOnPlatform(platform, url, title) {
        let shareUrl = '';
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'pinterest':
                // Try to get the first image from the article
                const images = document.querySelectorAll('.image-carousel img');
                let imageUrl = '';
                if (images.length > 0) {
                    imageUrl = encodeURIComponent(images[0].src);
                }
                shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${imageUrl}&description=${encodedTitle}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    }

    getDemoArticles() {
        return [
            {
                id: 1,
                title: "Revolutionary CAD Design Wins International Award",
                author: "John Smith",
                publication: "Design Weekly",
                date: "2024-01-15",
                content: "Our latest CAD design project has been recognized with the prestigious International Design Excellence Award. This innovative approach to jewelry design combines traditional craftsmanship with cutting-edge technology, resulting in pieces that are both beautiful and technically superior.\n\nThe award-winning design features intricate geometric patterns that would be impossible to create using traditional methods. By leveraging advanced CAD software and 3D printing technology, we were able to achieve unprecedented levels of detail and precision.\n\nThis recognition validates our commitment to pushing the boundaries of what's possible in jewelry design and manufacturing. The project involved months of research and development, working closely with our team of expert designers and engineers.\n\nThe winning piece showcases a complex lattice structure that maximizes both strength and aesthetic appeal. Using parametric design principles, we were able to create variations of the design that can be customized for different clients while maintaining the core geometric integrity.\n\nLooking forward, this award opens new opportunities for collaboration with international brands and designers who are seeking innovative approaches to jewelry manufacturing.",
                image_url: "/uploads/articles/award-design.jpg",
                images: [
                    { url: "/uploads/articles/award-design.jpg" },
                    { url: "/uploads/articles/award-ceremony.jpg" },
                    { url: "/uploads/articles/award-detail.jpg" }
                ],
                tags: ["Award", "CAD Design", "Innovation", "Jewelry"],
                created_at: "2024-01-15T10:00:00Z"
            },
            {
                id: 2,
                title: "New Sustainable Materials in Jewelry Design",
                author: "Maria Garcia",
                publication: "Eco Design Magazine",
                date: "2024-01-10",
                content: "The jewelry industry is embracing sustainable materials and ethical practices. Our recent collaboration with eco-friendly suppliers has resulted in stunning pieces that don't compromise on beauty or quality.\n\nWe've been experimenting with recycled precious metals, ethically sourced gemstones, and innovative bio-materials. These materials not only reduce environmental impact but also offer unique aesthetic properties that enhance the overall design.\n\nCustomers are increasingly conscious about the environmental and social impact of their purchases, and we're proud to offer beautiful alternatives that align with their values. Our sustainable collection has received overwhelming positive response from both clients and industry experts.\n\nThe process of sourcing sustainable materials requires careful vetting of suppliers and understanding of their environmental and social practices. We work only with certified suppliers who meet our strict ethical standards.\n\nMoving forward, sustainability will continue to be a core principle in all our design and manufacturing processes.",
                image_url: "/uploads/articles/sustainable-jewelry.jpg",
                tags: ["Sustainability", "Eco-friendly", "Ethical", "Materials"],
                created_at: "2024-01-10T14:30:00Z"
            },
            {
                id: 3,
                title: "Behind the Scenes: CAD to Creation Process",
                author: "David Chen",
                publication: "Tech Craft Review",
                date: "2024-01-05",
                content: "Take an inside look at our comprehensive design and manufacturing process, from initial CAD concept to finished jewelry piece.\n\nOur process begins with detailed consultations with clients to understand their vision, preferences, and requirements. We then create precise 3D models using advanced CAD software, allowing clients to visualize their piece before production begins.\n\nOnce the design is approved, we use state-of-the-art 3D printing technology to create wax models, which are then cast using traditional lost-wax casting techniques. This hybrid approach combines the precision of modern technology with time-tested craftsmanship methods.\n\nQuality control is paramount throughout the entire process. Each piece undergoes multiple inspections and refinements to ensure it meets our exacting standards before delivery to the client.\n\nThe integration of traditional and modern techniques allows us to offer both efficiency and artistic excellence in every piece we create.",
                image_url: "/uploads/articles/cad-process.jpg",
                images: [
                    { url: "/uploads/articles/cad-process.jpg" },
                    { url: "/uploads/articles/3d-printing.jpg" },
                    { url: "/uploads/articles/casting-process.jpg" },
                    { url: "/uploads/articles/final-product.jpg" }
                ],
                tags: ["CAD", "3D Printing", "Manufacturing", "Process"],
                created_at: "2024-01-05T09:15:00Z"
            },
            {
                id: 4,
                title: "Trends in Modern Jewelry Design 2024",
                author: "Sarah Johnson",
                publication: "Style Forward",
                date: "2023-12-28",
                content: "Explore the latest trends shaping the jewelry industry in 2024, from minimalist designs to bold statement pieces.\n\nThis year, we're seeing a strong trend toward personalization and customization. Clients want pieces that tell their unique story and reflect their individual style. Technology has made it possible to create truly bespoke pieces at accessible price points.\n\nGeometric patterns, mixed metals, and asymmetrical designs are particularly popular, offering a modern twist on classic jewelry aesthetics. These trends reflect a broader cultural shift toward individual expression and artistic innovation.\n\nSustainability continues to influence design choices, with many designers incorporating recycled materials and ethical sourcing into their creative process. This has led to new aesthetic possibilities and innovative material combinations.\n\nLooking ahead, we expect to see even more integration of technology in both design and manufacturing processes, opening up new possibilities for creative expression.",
                image_url: "/uploads/articles/jewelry-trends.jpg",
                tags: ["Trends", "2024", "Design", "Fashion"],
                created_at: "2023-12-28T16:45:00Z"
            }
        ];
    }
}

// Initialize news details page
const newsDetailsPage = new NewsDetailsPage();