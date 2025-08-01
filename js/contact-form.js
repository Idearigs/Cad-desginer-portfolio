/**
 * Contact Form Handler
 * Handles form submission, validation, and feedback
 */
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = this.submitBtn ? this.submitBtn.querySelector('.btn-text') : null;
        this.btnLoading = this.submitBtn ? this.submitBtn.querySelector('.btn-loading') : null;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Show loading state
        this.setLoading(true);
        
        try {
            const formData = new FormData(this.form);
            
            // Add honeypot field
            formData.append('honeypot', '');
            
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Show success message
                this.showMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
                this.form.reset();
                
                // Redirect if redirect URL is provided
                if (result.redirect) {
                    setTimeout(() => {
                        window.location.href = result.redirect;
                    }, 2000);
                }
            } else {
                // Show error message
                const errorMsg = result.message || 'Failed to send message. Please try again.';
                this.showMessage(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('An error occurred. Please try again later.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        return isValid;
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    showFieldError(field, message) {
        let errorElement = field.nextElementSibling;
        
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = message;
        field.classList.add('error');
    }
    
    clearFieldError(field) {
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
        field.classList.remove('error');
    }
    
    showMessage(message, type) {
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create and show new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Insert after the form
        this.form.parentNode.insertBefore(messageElement, this.form.nextSibling);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => messageElement.remove(), 300);
        }, 5000);
    }
    
    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            if (this.btnText) this.btnText.style.display = 'none';
            if (this.btnLoading) this.btnLoading.style.display = 'inline-block';
        } else {
            this.submitBtn.disabled = false;
            if (this.btnText) this.btnText.style.display = 'inline-block';
            if (this.btnLoading) this.btnLoading.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
});
