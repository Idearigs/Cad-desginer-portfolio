// Clean Admin Dashboard JavaScript - Simplified for testing

class AdminDashboardClean {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'news';
        this.articles = [];
        this.events = [];
        this.galleryImages = [];
        
        // Use clean API URLs
        this.apiBaseUrl = '/jewellery-designer/cad-art/api';
        console.log('Clean API Base URL:', this.apiBaseUrl);
        
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.loadData();
    }

    // Simple API request without complex error handling
    async apiRequest(url, options = {}) {
        // Handle relative paths
        if (!url.startsWith('http')) {
            if (url.startsWith('/')) {
                url = url.substring(1);
            }
            if (url.startsWith('api/')) {
                url = url.substring(4);
            }
            url = `${this.apiBaseUrl}/${url}`;
        }
        
        console.log('API Request URL:', url);
        
        const defaultOptions = {
            credentials: 'include',
            headers: new Headers()
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, mergedOptions);
            
            if (response.status === 401) {
                this.showLogin();
                throw new Error('Authentication required');
            }
            
            return response;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
    
    async checkAuthStatus() {
        // Simple auth check - just show login for now
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.loadData();
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
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        const submitBtn = document.querySelector('.login-btn');

        submitBtn.disabled = true;
        errorDiv.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            // Use clean login endpoint
            const loginUrl = `${this.apiBaseUrl}/auth/login_clean.php`;
            console.log('Clean Login API URL:', loginUrl);
            
            const response = await fetch(loginUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            const data = await response.json();
            console.log('Login response:', data);
            
            if (response.ok && data.status === 'success') {
                this.currentUser = data.data;
                this.showDashboard();
                this.showAlert('Login successful!', 'success');
            } else {
                errorDiv.textContent = data.message || 'Login failed';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
        }
    }

    async handleLogout() {
        this.currentUser = null;
        this.showLogin();
        this.showAlert('Logged out successfully!', 'success');
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
        
        this.currentTab = tabName;
    }

    async loadData() {
        this.loadTabContent(this.currentTab);
    }

    // News Management
    async loadArticles() {
        try {
            // Use clean API
            const response = await this.apiRequest('news/index_clean.php', {
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

    renderArticles() {
        const container = document.getElementById('articlesList');
        
        if (this.articles.length === 0) {
            container.innerHTML = '<div class="empty-state">No articles found. Click "Add Article" to create one.</div>';
            return;
        }
        
        container.innerHTML = this.articles.map(article => {
            const imagePath = article.image ? `uploads/articles/${article.image}` : 'images/placeholder.svg';
            const articleDate = article.date ? new Date(article.date).toLocaleDateString() : '';
            
            return `
            <div class="minimal-card">
                <div class="minimal-card-image">
                    <img src="${imagePath}" alt="${article.title}" onerror="this.src='images/placeholder.svg'">
                </div>
                <div class="minimal-card-content">
                    <div class="minimal-card-date">${articleDate}</div>
                    <h3 class="minimal-card-title">${article.title}</h3>
                    <p class="minimal-card-excerpt">${article.content ? article.content.substring(0, 80) + '...' : 'No content'}</p>
                    <a href="news-details.html?id=${article.id}" class="minimal-card-link">Read More</a>
                </div>
                <div class="minimal-card-actions">
                    <button class="minimal-btn edit-btn" onclick="admin.editArticle(${article.id})" title="Edit Article">Edit</button>
                    <button class="minimal-btn delete-btn" onclick="admin.deleteArticle(${article.id})" title="Delete Article">Delete</button>
                </div>
            </div>
        `}).join('');
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
            document.getElementById('articleForm').dataset.articleId = '';
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideNewsForm() {
        const modal = document.getElementById('newsFormModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    async handleArticleSubmit() {
        const form = document.getElementById('articleForm');
        const articleId = form.dataset.articleId;
        
        try {
            const formData = new FormData(form);
            
            let url = 'news/index_clean.php';
            let method = 'POST';
            
            if (articleId) {
                formData.append('action', 'update');
                formData.append('id', articleId);
            }
            
            const response = await this.apiRequest(url, {
                method: method,
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save article');
            }
            
            this.hideNewsForm();
            this.loadArticles();
            this.showAlert(articleId ? 'Article updated successfully!' : 'Article added successfully!', 'success');
        } catch (error) {
            console.error('Error saving article:', error);
            this.showAlert(error.message || 'Failed to save article', 'error');
        }
    }

    async deleteArticle(id) {
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                const response = await this.apiRequest(`news/index_clean.php?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete article');
                }
                
                this.loadArticles();
                this.showAlert('Article deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting article:', error);
                this.showAlert(error.message || 'Failed to delete article', 'error');
            }
        }
    }

    // Stub methods for other functionality
    async loadEvents() {
        console.log('Loading events...');
    }

    async loadGallery() {
        console.log('Loading gallery...');
    }

    showAlert(message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Simple alert for now
        alert(message);
    }
}

// Initialize clean admin dashboard
const admin = new AdminDashboardClean();