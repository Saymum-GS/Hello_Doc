/* ========================================
   COMPONENTS.JS - Dynamic Component Loader
   Loads navbar and footer dynamically
   ======================================== */

// Load component HTML
async function loadComponent(elementId, componentPath) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error('Component not found');
        const html = await response.text();
        placeholder.innerHTML = html;
        
        // Initialize components after loading
        if (elementId === 'navbar-placeholder') {
            initMobileMenu();
            initThemeToggle();
            highlightActiveLink();
        }
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// Initialize mobile menu toggle
function initMobileMenu() {
    const toggle = document.getElementById('navbar-toggle');
    const menu = document.getElementById('navbar-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        const navLinks = menu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }
}

// Initialize theme toggle (Dark Mode)
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('diu_mc_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('diu_mc_theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    });
}

// Update theme toggle icon
function updateThemeIcon(isDark) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
    }
}

// Highlight active navigation link
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
            link.classList.add('active');
        }
    });
}

// Load navbar and footer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Determine the correct path based on current location
    const isInPages = window.location.pathname.includes('/pages/');
    const basePath = isInPages ? '../' : '';
    
    loadComponent('navbar-placeholder', `${basePath}components/navbar.html`);
    loadComponent('footer-placeholder', `${basePath}components/footer.html`);
});