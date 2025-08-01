// Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'news';
        this.articles = [];
        this.events = [];
        this.galleryImages = [];
        
        // Determine API base URL based on environment
        this.apiBaseUrl = this.getApiBaseUrl();
        console.log('API Base URL:', this.apiBaseUrl);
        
        this.init();
    }
    
    // Helper function to determine API base URL based on environment
    getApiBaseUrl() {
        const hostname = window.location.hostname;
        const origin = window.location.origin;
        const pathname = window.location.pathname;
        
        // Check if we're on localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return origin + '/jewellery-designer/cad-art/api';
        }
        
        // Production environment - use relative path
        return origin + '/api';
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.loadData();
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Helper function for API calls with authentication
    async apiRequest(url, options = {}) {
        // Get the authentication token
        const token = localStorage.getItem('adminToken');
        
        // Handle relative paths by prepending the API base URL
        if (!url.startsWith('http')) {
            // Remove leading slash if present
            if (url.startsWith('/')) {
                url = url.substring(1);
            }
            
            // Remove 'api/' prefix if present since it's already in the base URL
            if (url.startsWith('api/')) {
                url = url.substring(4);
            }
            
            // Construct full URL
            url = `${this.apiBaseUrl}/${url}`;
        }
        
        console.log('API Request URL:', url);
        
        // Set up default options
        const defaultOptions = {
            credentials: 'include',
            headers: new Headers()
        };
        
        // Merge options
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Add authentication header if token exists
        if (token) {
            mergedOptions.headers.append('Authorization', `Bearer ${token}`);
        }
        
        try {
            const response = await fetch(url, mergedOptions);
            
            // Handle authentication errors
            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                this.showLogin();
                throw new Error('Authentication required. Please log in again.');
            }
            
            return response;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
    
    async checkAuthStatus() {
        // First check local storage for quick UI decision
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            this.showLogin();
            return;
        }
        
        try {
            // Verify session with backend using our helper
            const authCheckUrl = `${this.apiBaseUrl}/news/index.php`;
            console.log('Auth check URL:', authCheckUrl);
            
            const response = await this.apiRequest(authCheckUrl, {
                method: 'GET'
            });
            
            if (response.ok) {
                // Session is valid
                this.showDashboard();
            } else {
                // Session expired or invalid
                localStorage.removeItem('adminToken');
                this.showLogin();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.showLogin();
        }
    }

    validateToken(token) {
        // Implement proper token validation here
        // For demo purposes, just check if token exists
        return token && token.length > 0;
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.loadData(); // Load data for the current tab
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Tab navigation
        document.querySelectorAll('.tab-trigger').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // News Management
        document.getElementById('addNewsBtn').addEventListener('click', () => {
            this.showNewsForm();
        });
        
        document.getElementById('closeNewsForm').addEventListener('click', () => {
            this.hideNewsForm();
        });
        
        document.getElementById('cancelArticle').addEventListener('click', () => {
            this.hideNewsForm();
        });
        
        document.getElementById('articleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleArticleSubmit();
        });

        // Event Management
        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.showEventForm();
        });
        
        document.getElementById('closeEventForm').addEventListener('click', () => {
            this.hideEventForm();
        });
        
        document.getElementById('cancelEvent').addEventListener('click', () => {
            this.hideEventForm();
        });
        
        document.getElementById('eventFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEventSubmit();
        });

        // Gallery Management
        document.getElementById('addGalleryBtn').addEventListener('click', () => {
            this.showGalleryForm();
        });
        
        document.getElementById('closeGalleryForm').addEventListener('click', () => {
            this.hideGalleryForm();
        });
        
        document.getElementById('cancelGallery').addEventListener('click', () => {
            this.hideGalleryForm();
        });
        
        document.getElementById('galleryFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGallerySubmit();
        });
        
        // Close modals when clicking outside content area
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'newsFormModal') this.hideNewsForm();
                    if (modal.id === 'eventFormModal') this.hideEventForm();
                    if (modal.id === 'galleryFormModal') this.hideGalleryForm();
                }
            });
        });
        
        // Add keyboard support for closing modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal-overlay.active');
                activeModals.forEach(modal => {
                    if (modal.id === 'newsFormModal') this.hideNewsForm();
                    if (modal.id === 'eventFormModal') this.hideEventForm();
                    if (modal.id === 'galleryFormModal') this.hideGalleryForm();
                });
            }
        });

        // End of event bindings
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        const submitBtn = document.querySelector('.login-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
        errorDiv.style.display = 'none';

        try {
            // Create form data for submission
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            // Send login request to backend using the determined API base URL
            const loginUrl = `${this.apiBaseUrl}/auth/login.php`;
            console.log('Login API URL:', loginUrl);
            
            const response = await fetch(loginUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include' // Include cookies for session
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                // Generate a simple token based on username and timestamp
                // In a real app, this would be a JWT or other secure token from the server
                const timestamp = new Date().getTime();
                const simpleToken = btoa(`${username}:${timestamp}`);
                
                // Store token in localStorage for UI purposes
                localStorage.setItem('adminToken', simpleToken);
                
                this.currentUser = data.data;
                this.showDashboard();
                this.showAlert('Login successful!', 'success');
            } else {
                errorDiv.textContent = data.message || 'Invalid username or password';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.display = 'block';
        } finally {
            // Hide loading state
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    async handleLogout() {
        try {
            // Call logout API using the determined API base URL
            const logoutUrl = `${this.apiBaseUrl}/auth/logout.php`;
            console.log('Logout URL:', logoutUrl);
            
            const response = await fetch(logoutUrl, {
                method: 'POST',
                credentials: 'include' // Include cookies for session
            });
            
            // Clear local storage regardless of API response
            localStorage.removeItem('adminToken');
            this.currentUser = null;
            this.showLogin();
            this.showAlert('Logged out successfully!', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            // Still logout client-side even if API fails
            localStorage.removeItem('adminToken');
            this.currentUser = null;
            this.showLogin();
        }
    }

    switchTab(tabName) {
        // Update tab triggers
        document.querySelectorAll('.tab-trigger').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show selected tab content
        document.getElementById(`${tabName}Tab`).style.display = 'block';
        
        // Update active tab trigger
        document.querySelectorAll('.tab-trigger').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Load tab-specific data
        switch(tabName) {
            case 'news':
                this.loadArticles();
                break;
            case 'events':
                this.loadEvents();
                break;
            case 'gallery':
                this.loadGallery();
                break;
        }
        
        // Store current tab
        this.currentTab = tabName;
    }

    async loadData() {
        // Initialize data structures
        this.articles = [];
        this.events = [];
        this.galleryImages = [];
        this.galleryCategories = [];
        
        // Load data for the current tab only
        // This avoids making unnecessary API calls for tabs that aren't visible
        this.loadTabContent(this.currentTab);
    }

    // News Management
    async loadArticles() {
        try {
            const response = await this.apiRequest('news/index.php', {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load articles');
            }
            
            const result = await response.json();
            this.articles = result.data || [];
            this.renderArticles();
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showAlert('Failed to load articles', 'error');
        }
    }

    showNewsForm(article = null) {
        const modal = document.getElementById('newsFormModal');
        const title = document.getElementById('newsFormTitle');
        
        if (article) {
            title.textContent = 'Edit Article';
            this.populateArticleForm(article);
        } else {
            title.textContent = 'Add New Article';
            document.getElementById('articleForm').reset();
            // Clear any previous article ID
            document.getElementById('articleForm').dataset.articleId = '';
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    populateArticleForm(article) {
        // Set the article ID in the form's dataset for update operations
        document.getElementById('articleForm').dataset.articleId = article.id;
        
        document.getElementById('articleTitle').value = article.title;
        document.getElementById('articleAuthor').value = article.author || '';
        document.getElementById('articlePublication').value = article.publication || '';
        document.getElementById('articleDate').value = article.date || '';
        document.getElementById('articleContent').value = article.content || '';
        
        // If there are tags, add them
        if (article.tags && article.tags.length > 0) {
            document.getElementById('articleTags').value = article.tags.join(', ');
        }
        
        console.log('Form populated with article ID:', article.id);
    }

    hideNewsForm() {
        const modal = document.getElementById('newsFormModal');
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    async handleArticleSubmit() {
        const form = document.getElementById('articleForm');
        const articleId = form.dataset.articleId;
        
        try {
            // Create FormData object to handle file uploads
            const formData = new FormData(form);
            
            // Parse tags (comma-separated) if the element exists
            const tagsElement = document.getElementById('articleTags');
            if (tagsElement && tagsElement.value) {
                // Remove tags from formData and handle separately in JSON
                const tags = tagsElement.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                formData.delete('tags');
                formData.append('tags', JSON.stringify(tags));
            }
            
            let url = 'news/index.php';
            let method = 'POST';
            
            // If editing, add the article ID and action to the form data
            if (articleId) {
                formData.append('action', 'update');
                formData.append('id', articleId);
            }
            
            // Use our apiRequest helper
            const response = await this.apiRequest(url, {
                method: method,
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save article');
            }
            
            const result = await response.json();
            
            this.hideNewsForm();
            this.loadArticles(); // Refresh the articles list
            this.showAlert(articleId ? 'Article updated successfully!' : 'Article added successfully!', 'success');
        } catch (error) {
            console.error('Error saving article:', error);
            this.showAlert(error.message || 'Failed to save article', 'error');
        }
    }

    renderArticles() {
        const container = document.getElementById('articlesList');
        
        if (this.articles.length === 0) {
            container.innerHTML = '<div class="empty-state">No articles found. Click "Add Article" to create one.</div>';
            return;
        }
        
        container.innerHTML = this.articles.map(article => {
            // Fix image path by checking if it's a full URL or just a filename
            let imagePath = article.image || article.image_url || 'images/placeholder.svg';
            if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
                imagePath = 'uploads/articles/' + imagePath; // Add uploads/articles directory prefix if it's just a filename
            }
            
            // Format date in a cleaner way
            const articleDate = article.date ? new Date(article.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            }) : '';
            
            return `
            <div class="minimal-card">
                <div class="minimal-card-image">
                    <img src="${imagePath}" alt="${article.title}" onerror="if(this.src!=='images/placeholder.svg')this.src='images/placeholder.svg'">
                </div>
                <div class="minimal-card-content">
                    <div class="minimal-card-date">${articleDate}</div>
                    <h3 class="minimal-card-title">${article.title}</h3>
                    <p class="minimal-card-excerpt">${article.content ? article.content.substring(0, 80) + '...' : 'No content'}</p>
                    <a href="news-details.html?id=${article.id}" class="minimal-card-link">Read More <i data-lucide="arrow-right"></i></a>
                </div>
                <div class="minimal-card-actions">
                    <button class="minimal-btn edit-btn" onclick="admin.editArticle(${article.id})" title="Edit Article">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="minimal-btn delete-btn" onclick="admin.deleteArticle(${article.id})" title="Delete Article">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `}).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    async editArticle(id) {
        try {
            const response = await this.apiRequest(`news/index.php?id=${id}`, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load article details');
            }
            
            const result = await response.json();
            const article = result.data;
            
            if (article) {
                this.showNewsForm(article);
            }
        } catch (error) {
            console.error('Error loading article details:', error);
            this.showAlert('Failed to load article details', 'error');
        }
    }

    async deleteArticle(id) {
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                const response = await this.apiRequest(`news/index.php?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete article');
                }
                
                this.loadArticles(); // Refresh the articles list
                this.showAlert('Article deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting article:', error);
                this.showAlert(error.message || 'Failed to delete article', 'error');
            }
        }
    }

    // Event Management
    showEventForm(event = null) {
        const modal = document.getElementById('eventFormModal');
        const title = document.getElementById('eventFormTitle');
        
        if (event) {
            title.textContent = 'Edit Event';
            this.populateEventForm(event);
        } else {
            title.textContent = 'Add New Event';
                        document.getElementById('eventFormElement').reset();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    hideEventForm() {
        const modal = document.getElementById('eventFormModal');
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }

    populateEventForm(event) {
        document.getElementById('eventTitle').value = event.title;
        
        // Set date if it exists in the form
        if (document.getElementById('eventDate')) {
            document.getElementById('eventDate').value = event.date || '';
        }
        
        document.getElementById('eventFormElement').dataset.eventId = event.id;
        // Image can't be populated due to security restrictions
    }

    async handleEventSubmit() {
        const form = document.getElementById('eventFormElement');
        const formData = new FormData(form);
        const eventId = form.dataset.eventId;
        
        // Validate required fields
        if (!formData.get('title')) {
            this.showAlert('Please provide a title for the event banner.', 'error');
            return;
        }
        
        try {
            let url = `${this.apiBaseUrl}/events/index.php`;
            let method = 'POST';
            
            // If editing, add the event ID to the URL but keep using POST
            if (eventId) {
                url += `?id=${eventId}`;
                // Add action parameter to FormData to indicate update
                formData.append('action', 'update');
            }
            
            const response = await this.apiRequest(url, {
                method: method,
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save event');
            }
            
            this.hideEventForm();
            this.loadEvents(); // Refresh the events list
            this.showAlert(eventId ? 'Event banner updated successfully!' : 'Event banner added successfully!', 'success');
        } catch (error) {
            console.error('Error saving event:', error);
            this.showAlert(error.message || 'Failed to save event banner', 'error');
        }
    }

    async loadEvents() {
        try {
            const response = await this.apiRequest('events/index.php', {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load events');
            }
            
            const result = await response.json();
            this.events = result.data || [];
            this.renderEvents();
        } catch (error) {
            console.error('Error loading events:', error);
            this.showAlert('Failed to load events', 'error');
        }
    }
    
    renderEvents() {
        const container = document.getElementById('eventsList');
        
        if (this.events.length === 0) {
            container.innerHTML = '<div class="empty-state">No events found. Click "Add Event" to create one.</div>';
            return;
        }
        
        container.innerHTML = this.events.map(event => {
            // Fix image path by checking if it's a full URL or just a filename
            let imagePath = event.image || event.image_url || 'images/placeholder.svg';
            if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
                imagePath = 'uploads/events/' + imagePath; // Add uploads/events directory prefix if it's just a filename
            }
            
            // Format date in a cleaner way
            const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            }) : '';
            
            const eventTime = event.time || '';
            const eventLocation = event.location || '';
            
            return `
            <div class="minimal-card" data-id="${event.id}">
                <div class="minimal-card-image">
                    <img src="${imagePath}" alt="${event.title}" onerror="if(this.src!=='images/placeholder.svg')this.src='images/placeholder.svg'">
                </div>
                <div class="minimal-card-content">
                    <div class="minimal-card-date">${eventDate}</div>
                    <h3 class="minimal-card-title">${event.title}</h3>
                    <div class="minimal-card-details">
                        ${eventTime ? `<span class="detail-item"><i data-lucide="clock"></i> ${eventTime}</span>` : ''}
                        ${eventLocation ? `<span class="detail-item"><i data-lucide="map-pin"></i> ${eventLocation}</span>` : ''}
                    </div>
                    <p class="minimal-card-excerpt">${event.description ? event.description.substring(0, 80) + '...' : 'No description'}</p>
                </div>
                <div class="minimal-card-actions">
                    <button class="minimal-btn edit-btn" onclick="admin.editEvent(${event.id})" title="Edit Event">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="minimal-btn delete-btn" onclick="admin.deleteEvent(${event.id})" title="Delete Event">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            `;
        }).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    async deleteArticle(id) {
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                const response = await this.apiRequest(`news/index.php?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete article');
                }
                
                this.loadArticles(); // Refresh the articles list
                this.showAlert('Article deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting article:', error);
                this.showAlert(error.message || 'Failed to delete article', 'error');
            }
        }
    }

    // Event Management
    showEventForm(event = null) {
        const modal = document.getElementById('eventFormModal');
        const title = document.getElementById('eventFormTitle');
        
        if (event) {
            title.textContent = 'Edit Event';
            this.populateEventForm(event);
        } else {
            title.textContent = 'Add New Event';
            document.getElementById('eventFormElement').reset();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    async editEvent(id) {
        try {
            const response = await this.apiRequest(`events/index.php?id=${id}`, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load event details');
            }
            
            const result = await response.json();
            const event = result.data;
            
            if (event) {
                this.showEventForm(event);
            }
        } catch (error) {
            console.error('Error loading event details:', error);
            this.showAlert('Failed to load event details', 'error');
        }
    }

    async deleteEvent(id) {
        if (confirm('Are you sure you want to delete this event banner?')) {
            try {
                const response = await this.apiRequest(`events/index.php?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete event');
                }
                
                this.loadEvents(); // Refresh the events list
                this.showAlert('Event banner deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting event:', error);
                this.showAlert(error.message || 'Failed to delete event banner', 'error');
            }
        }
    }

    async moveEventUp(id) {
        try {
            const index = this.events.findIndex(e => e.id === id);
            if (index <= 0) return; // Already at the top
            
            // Get the current order of events
            const eventIds = this.events.map(e => e.id);
            
            // Swap positions
            [eventIds[index], eventIds[index - 1]] = [eventIds[index - 1], eventIds[index]];
            
            // Send the new order to the API using our helper
            const response = await this.apiRequest(`${this.getApiBaseUrl()}/events/index.php?action=reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order: eventIds })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update event order');
            }
            
            this.loadEvents(); // Refresh with new order
            this.showAlert('Event banner moved up successfully', 'success');
        } catch (error) {
            console.error('Error reordering events:', error);
            this.showAlert(error.message || 'Failed to update event order', 'error');
        }
    }
    
    async moveEventDown(id) {
        try {
            const index = this.events.findIndex(e => e.id === id);
            if (index === -1 || index >= this.events.length - 1) return; // Already at the bottom
            
            // Get the current order of events
            const eventIds = this.events.map(e => e.id);
            
            // Swap positions
            [eventIds[index], eventIds[index + 1]] = [eventIds[index + 1], eventIds[index]];
            
            // Send the new order to the API using our helper
            const response = await this.apiRequest(`${this.getApiBaseUrl()}/events/index.php?action=reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order: eventIds })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update event order');
            }
            
            this.loadEvents(); // Refresh with new order
            this.showAlert('Event banner moved down successfully', 'success');
        } catch (error) {
            console.error('Error reordering events:', error);
            this.showAlert(error.message || 'Failed to update event order', 'error');
        }
    }

    // Gallery Management
    showGalleryForm(isEdit = false) {
        const modal = document.getElementById('galleryFormModal');
        const form = document.getElementById('galleryFormElement');
        
        // Only reset form if not in edit mode
        if (!isEdit) {
            form.reset();
            delete form.dataset.imageId;
            
            // Reset form title
            document.querySelector('#galleryForm .form-header h3').textContent = 'Add Gallery Images';
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    hideGalleryForm() {
        const modal = document.getElementById('galleryFormModal');
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }

    async handleGallerySubmit() {
        const form = document.getElementById('galleryFormElement');
        const formData = new FormData(form);
        const fileInput = form.querySelector('input[name="images"]');
        const files = fileInput.files || [];
        const title = formData.get('title');
        const imageId = form.dataset.imageId;
        
        if (!title) {
            this.showAlert('Please enter a title for the image.', 'error');
            return;
        }
        
        // For new images, require file selection
        if (!imageId && files.length === 0) {
            this.showAlert('Please select at least one image.', 'error');
            return;
        }

        try {
            if (imageId) {
                // Update existing image
                const updateFormData = new FormData();
                updateFormData.append('title', title);
                if (files.length > 0) {
                    // Use 'image' as the field name to match what the PHP API expects
                    updateFormData.append('image', files[0]); // Only use first file for updates
                    console.log('Updating image with file:', files[0].name);
                }
                
                const response = await this.apiRequest(`${this.getApiBaseUrl()}/gallery/index.php?id=${imageId}&action=update`, {
                    method: 'POST',
                    body: updateFormData
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update image');
                }
                
                this.showAlert('Image updated successfully!', 'success');
            } else {
                // Create new images
                this.showAlert(`Uploading ${files.length} image(s)...`, 'info');
                
                // Upload each image individually
                for (const file of files) {
                    const singleFormData = new FormData();
                    singleFormData.append('image', file);
                    singleFormData.append('title', title);
                    
                    const response = await this.apiRequest('gallery/index.php', {
                        method: 'POST',
                        body: singleFormData
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Failed to upload ${file.name}`);
                    }
                }
                
                this.showAlert(`${files.length} image(s) uploaded successfully!`, 'success');
            }
            
            this.loadGallery(); // Refresh the gallery
            this.hideGalleryForm();
        } catch (error) {
            console.error('Error uploading images:', error);
            this.showAlert(error.message || 'Failed to upload images. Please try again.', 'error');
        }
    }

    async loadGallery() {
        try {
            // Load all gallery images using our helper
            const response = await this.apiRequest('gallery/index.php', {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load gallery images');
            }
            
            const result = await response.json();
            this.galleryImages = result.data || [];
            this.renderGallery();
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.showAlert('Failed to load gallery images', 'error');
        }
    }

    renderGallery() {
        const container = document.getElementById('galleryList');
        
        if (!this.galleryImages || this.galleryImages.length === 0) {
            container.innerHTML = '<div class="empty-state">No images found. Click "Upload Images" to add some!</div>';
            return;
        }

        // Create HTML for gallery images
        const html = `
            <div class="gallery-grid">
                ${this.galleryImages.map(image => {
                    // Format date in a cleaner way
                    const uploadDate = image.created_at ? new Date(image.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    }) : '';
                    
                    return `
                    <div class="minimal-gallery-card" data-id="${image.id}">
                        <div class="minimal-gallery-image">
                            <img src="${image.image_url}" alt="${image.title || 'Gallery image'}" onerror="if(this.src!=='images/placeholder.svg')this.src='images/placeholder.svg'">
                        </div>
                        <div class="minimal-gallery-content">
                            <h4 class="minimal-gallery-title">${image.title || 'Untitled'}</h4>
                            <div class="minimal-gallery-category">${image.category || ''}</div>
                            <div class="minimal-gallery-date"><i data-lucide="calendar"></i> ${uploadDate}</div>
                        </div>
                        <div class="minimal-gallery-actions">
                            <button class="minimal-btn edit-btn" onclick="admin.editGalleryImage(${image.id})" title="Edit Image">
                                <i data-lucide="pencil"></i>
                            </button>
                            <button class="minimal-btn delete-btn" onclick="admin.deleteGalleryImage(${image.id})" title="Delete Image">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;

        container.innerHTML = html;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    async deleteGalleryImage(id) {
        if (confirm('Are you sure you want to delete this image?')) {
            try {
                const response = await this.apiRequest(`gallery/index.php?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete image');
                }
                
                this.loadGallery(); // Refresh the gallery
                this.showAlert('Image deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting image:', error);
                this.showAlert(error.message || 'Failed to delete image', 'error');
            }
        }
    }

    async editGalleryImage(id) {
        try {
            const response = await this.apiRequest(`gallery/index.php?id=${id}`, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load image details');
            }
            
            const result = await response.json();
            const image = result.data;
            
            if (image) {
                // Populate the form with existing data
                document.getElementById('galleryTitle').value = image.title;
                document.getElementById('galleryFormElement').dataset.imageId = image.id;
                
                // Update form title
                document.querySelector('#galleryForm .form-header h3').textContent = 'Edit Gallery Image';
                
                // Show the form with isEdit flag to prevent resetting
                this.showGalleryForm(true);
                
                console.log('Edit mode activated for image ID:', id);
            }
        } catch (error) {
            console.error('Error loading image details:', error);
            this.showAlert('Failed to load image details', 'error');
        }
    }

    
    // End of Gallery Management

    // Utility Functions
    showAlert(message, type = 'success') {
        const container = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.innerHTML = `
            <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(alert);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // Demo Data
    getDemoArticles() {
        return [
            {
                id: 1,
                title: "Revolutionary CAD Design Wins International Award",
                author: "John Smith",
                publication: "Design Weekly",
                date: "2024-01-15",
                content: "Our latest CAD design project has been recognized with the prestigious International Design Excellence Award. This innovative approach to jewelry design combines traditional craftsmanship with cutting-edge technology...",
                image: "award-winning-design.jpg",
                created_at: "2024-01-15T10:00:00Z"
            },
            {
                id: 2,
                title: "New Sustainable Materials in Jewelry Design",
                author: "Maria Garcia",
                publication: "Eco Design Magazine",
                date: "2024-01-10",
                content: "The jewelry industry is embracing sustainable materials and ethical practices. Our recent collaboration with eco-friendly suppliers has resulted in stunning pieces that don't compromise on beauty or quality...",
                image: "sustainable-jewelry.jpg",
                created_at: "2024-01-10T14:30:00Z"
            }
        ];
    }

    getDemoEvents() {
        return [
            {
                id: 1,
                title: "Annual Jewelry Design Exhibition",
                date: "2024-03-15",
                time: "18:00",
                location: "Grand Exhibition Hall, Downtown",
                description: "Join us for our annual showcase of the year's most innovative jewelry designs. This exclusive event will feature live demonstrations, networking opportunities, and special presentations.",
                image: "exhibition.jpg",
                created_at: "2024-01-01T00:00:00Z"
            },
            {
                id: 2,
                title: "CAD Workshop for Beginners",
                date: "2024-02-28",
                time: "14:00",
                location: "Design Studio, Main Street",
                description: "Learn the fundamentals of computer-aided design for jewelry. This hands-on workshop covers basic CAD principles, software introduction, and practical exercises.",
                image: "workshop.jpg",
                created_at: "2024-01-01T00:00:00Z"
            }
        ];
    }

    getDemoGalleryImages() {
        return [
            { id: 1, filename: "award1.jpg", category: "awards", uploaded_at: "2024-01-01T00:00:00Z" },
            { id: 2, filename: "award2.jpg", category: "awards", uploaded_at: "2024-01-01T00:00:00Z" },
            { id: 3, filename: "project1.jpg", category: "projects", uploaded_at: "2024-01-01T00:00:00Z" },
            { id: 4, filename: "event1.jpg", category: "events", uploaded_at: "2024-01-01T00:00:00Z" }
        ];
    }
}

// Initialize admin dashboard
const admin = new AdminDashboard();