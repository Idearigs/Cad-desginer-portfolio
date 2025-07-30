// News Page JavaScript

class NewsPage {
    constructor() {
        this.articles = [];
        this.init();
    }

    init() {
        this.loadArticles();
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    async loadArticles() {
        try {
            // Show loading indicator
            const newsGrid = document.querySelector('.news-grid');
            if (newsGrid) {
                newsGrid.innerHTML = '<div class="loading-message" style="text-align: center; padding: 40px;"><p>Loading articles...</p></div>';
            }
            
            // Fetch articles from the API
            const apiUrl = 'api/news/index.php';
            console.log('Fetching articles from:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API response data:', result);
            
            if (result.status === 'success' && Array.isArray(result.data)) {
                this.articles = result.data;
                console.log('Articles loaded from API:', this.articles.length);
                
                // Debug first article's image path
                if (this.articles.length > 0) {
                    console.log('First article image_url:', this.articles[0].image_url);
                    console.log('First article data:', this.articles[0]);
                }
            } else {
                // Fallback to demo data if API returns unexpected format
                console.warn('API returned unexpected format, trying demo data');
                this.articles = this.getDemoArticles();
                console.log('Using demo articles:', this.articles.length);
            }
            
            if (this.articles.length === 0) {
                // Show empty message
                if (newsGrid) {
                    newsGrid.innerHTML = '<div style="text-align: center; padding: 40px;"><p>No news articles found</p></div>';
                }
            } else {
                this.renderArticles();
            }
        } catch (error) {
            console.error('Error loading articles:', error);
            
            // Try to fall back to demo data
            console.warn('Trying demo data due to API error');
            this.articles = this.getDemoArticles();
            console.log('Using demo articles after error:', this.articles.length);
            
            if (this.articles.length === 0) {
                // Show error message
                const newsGrid = document.querySelector('.news-grid');
                if (newsGrid) {
                    newsGrid.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Failed to load articles. Please try again later.</p></div>';
                }
            } else {
                this.renderArticles();
            }
        }
    }

    renderArticles() {
        // Get the news grid container
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;
        
        // Clear existing content
        newsGrid.innerHTML = '';
        
        // Sort articles by date (newest first)
        this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Render all articles
        this.articles.forEach(article => {
            // Determine the image source - use image field if image_url is null
            let imageSrc;
            if (article.image_url) {
                imageSrc = this.getImageUrl(article.image_url);
            } else if (article.image) {
                // Images are stored in uploads/articles directory
                imageSrc = `uploads/articles/${article.image}`;
                console.log('Using article.image path:', imageSrc);
            } else {
                imageSrc = 'images/placeholder.svg';
            }
            
            const articleEl = document.createElement('div');
            articleEl.className = 'news-card';
            articleEl.innerHTML = `
                <div class="news-img-container">
                    <img src="${imageSrc}" alt="${this.escapeHtml(article.title)}" onerror="this.src='images/placeholder.svg'">
                </div>
                <div class="news-content">
                    <span class="news-date">${this.formatDate(article.date)}</span>
                    <h3>${this.escapeHtml(article.title)}</h3>
                    <p>${this.getExcerpt(article.content, 120)}</p>
                    <a href="news-details.html?id=${article.id}" class="news-link">Read More <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
                </div>
            `;
            
            newsGrid.appendChild(articleEl);
        });
    }

    getImageUrl(imagePath) {
        console.log('Original image path:', imagePath);
        
        if (!imagePath) {
            console.log('No image path provided, using placeholder');
            return 'images/placeholder.svg';
        }
        
        // If the image path is a full URL, return it as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            console.log('Using full URL image path:', imagePath);
            return imagePath;
        }
        
        // If it's a relative path starting with /, remove the leading slash
        if (imagePath.startsWith('/')) {
            const formattedPath = imagePath.substring(1);
            console.log('Removed leading slash from path:', formattedPath);
            return formattedPath;
        }
        
        // Otherwise, return the path as is
        console.log('Using image path as is:', imagePath);
        return imagePath;
    }
    
    getExcerpt(content, maxLength = 150) {
        if (!content) return '';
        
        if (content.length <= maxLength) return content;
        
        // Find the last space before maxLength
        const lastSpace = content.substring(0, maxLength).lastIndexOf(' ');
        const end = lastSpace > 0 ? lastSpace : maxLength;
        
        return content.substring(0, end) + '...';
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Invalid date
            
            // Format: Month Day, Year (e.g., January 15, 2024)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    // Helper method to escape HTML to prevent XSS
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    navigateToArticle(id) {
        // Navigate to article details page
        window.location.href = `news-details.html?id=${id}`;
    }

    getDemoArticles() {
        return [
            {
                id: 1,
                title: "Revolutionary CAD Design Wins International Award",
                author: "John Smith",
                publication: "Design Weekly",
                date: "2024-01-15",
                content: "Our latest CAD design project has been recognized with the prestigious International Design Excellence Award. This innovative approach to jewelry design combines traditional craftsmanship with cutting-edge technology, resulting in pieces that are both beautiful and technically superior.\n\nThe award-winning design features intricate geometric patterns that would be impossible to create using traditional methods. By leveraging advanced CAD software and 3D printing technology, we were able to achieve unprecedented levels of detail and precision.\n\nThis recognition validates our commitment to pushing the boundaries of what's possible in jewelry design and manufacturing.",
                image_url: "/uploads/articles/award-design.jpg",
                created_at: "2024-01-15T10:00:00Z"
            },
            {
                id: 2,
                title: "New Sustainable Materials in Jewelry Design",
                author: "Maria Garcia",
                publication: "Eco Design Magazine",
                date: "2024-01-10",
                content: "The jewelry industry is embracing sustainable materials and ethical practices. Our recent collaboration with eco-friendly suppliers has resulted in stunning pieces that don't compromise on beauty or quality.\n\nWe've been experimenting with recycled precious metals, ethically sourced gemstones, and innovative bio-materials. These materials not only reduce environmental impact but also offer unique aesthetic properties.\n\nCustomers are increasingly conscious about the environmental and social impact of their purchases, and we're proud to offer beautiful alternatives that align with their values.",
                image_url: "/uploads/articles/sustainable-jewelry.jpg",
                created_at: "2024-01-10T14:30:00Z"
            },
            {
                id: 3,
                title: "Behind the Scenes: CAD to Creation Process",
                author: "David Chen",
                publication: "Tech Craft Review",
                date: "2024-01-05",
                content: "Take an inside look at our comprehensive design and manufacturing process, from initial CAD concept to finished jewelry piece.\n\nOur process begins with detailed consultations with clients to understand their vision. We then create precise 3D models using advanced CAD software, allowing clients to visualize their piece before production begins.\n\nOnce the design is approved, we use state-of-the-art 3D printing technology to create wax models, which are then cast using traditional lost-wax casting techniques.",
                image_url: "/uploads/articles/cad-process.jpg",
                created_at: "2024-01-05T09:15:00Z"
            },
            {
                id: 4,
                title: "Trends in Modern Jewelry Design 2024",
                author: "Sarah Johnson",
                publication: "Style Forward",
                date: "2023-12-28",
                content: "Explore the latest trends shaping the jewelry industry in 2024, from minimalist designs to bold statement pieces.\n\nThis year, we're seeing a strong trend toward personalization and customization. Clients want pieces that tell their unique story and reflect their individual style.\n\nGeometric patterns, mixed metals, and asymmetrical designs are particularly popular, offering a modern twist on classic jewelry aesthetics.",
                image_url: "/uploads/articles/jewelry-trends.jpg",
                created_at: "2023-12-28T16:45:00Z"
            }
        ];
    }
}

// Initialize news page
const newsPage = new NewsPage();