/* ========================================
   APP.JS - Main Application File
   Initializes the DIU Medical Center application
   ======================================== */

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DIU Medical Center Application Initialized');
    
    // Initialize storage with seed data
    await Storage.init();
    
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation on scroll
    observeElements();

    // Show welcome message on home page
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        setTimeout(() => {
            Utils.showToast('Welcome to DIU Medical Center', 'info');
        }, 500);
    }
});

// Observe elements for scroll animations
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe feature cards, action cards, etc.
    const animatedElements = document.querySelectorAll('.feature-card, .action-card, .doctor-card, .contact-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Application Error:', e.error);
});

// Handle offline/online status
window.addEventListener('offline', () => {
    Utils.showToast('You are offline. Some features may not work.', 'warning');
});

window.addEventListener('online', () => {
    Utils.showToast('You are back online!', 'success');
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.filter-input, #search-doctor');
        if (searchInput) {
            searchInput.focus();
        }
    }
});