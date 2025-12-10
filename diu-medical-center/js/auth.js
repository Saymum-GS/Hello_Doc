/* ========================================
   AUTH.JS - Authentication (FIXED VERSION)
   Handles admin, patient, and doctor login/logout
   ======================================== */

const Auth = {
    // Admin credentials (hardcoded for demo)
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'admin123'
    },

    // Storage keys for auth status
    AUTH_KEYS: {
        ADMIN: 'diu_mc_admin_auth',
        PATIENT: 'diu_mc_patient_auth',
        DOCTOR: 'diu_mc_doctor_auth',
        CURRENT_USER: 'diu_mc_current_user'
    },

    // Check if user is logged in (any role)
    isAuthenticated() {
        const currentUser = this.getCurrentUser();
        return currentUser !== null;
    },

    // Check if admin is logged in
    isAdminAuthenticated() {
        const authData = localStorage.getItem(this.AUTH_KEYS.ADMIN);
        if (!authData) return false;
        
        try {
            const { isLoggedIn, timestamp } = JSON.parse(authData);
            
            // Session expires after 24 hours
            const sessionDuration = 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            if (now - timestamp > sessionDuration) {
                this.logout();
                return false;
            }
            
            return isLoggedIn;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    },

    // Check if patient is logged in
    isPatientAuthenticated() {
        const authData = localStorage.getItem(this.AUTH_KEYS.PATIENT);
        if (!authData) return false;
        
        try {
            const { isLoggedIn, timestamp } = JSON.parse(authData);
            const sessionDuration = 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            if (now - timestamp > sessionDuration) {
                this.logoutPatient();
                return false;
            }
            
            return isLoggedIn;
        } catch (error) {
            return false;
        }
    },

    // Check if doctor is logged in
    isDoctorAuthenticated() {
        const authData = localStorage.getItem(this.AUTH_KEYS.DOCTOR);
        if (!authData) return false;
        
        try {
            const { isLoggedIn, timestamp } = JSON.parse(authData);
            const sessionDuration = 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            if (now - timestamp > sessionDuration) {
                this.logoutDoctor();
                return false;
            }
            
            return isLoggedIn;
        } catch (error) {
            return false;
        }
    },

    // Admin Login
    loginAdmin(username, password) {
        if (username === this.ADMIN_CREDENTIALS.username && 
            password === this.ADMIN_CREDENTIALS.password) {
            
            const authData = {
                isLoggedIn: true,
                timestamp: Date.now(),
                username: username,
                role: 'admin'
            };
            
            localStorage.setItem(this.AUTH_KEYS.ADMIN, JSON.stringify(authData));
            localStorage.setItem(this.AUTH_KEYS.CURRENT_USER, JSON.stringify(authData));
            return { success: true };
        }
        
        return { 
            success: false, 
            message: 'Invalid username or password' 
        };
    },

    // Patient Login (using phone number)
    loginPatient(phone, password) {
        const patients = Storage.getPatients();
        const patient = patients.find(p => p.phone === phone);
        
        if (!patient) {
            return { 
                success: false, 
                message: 'Patient not found. Please register first.' 
            };
        }

        // For demo purposes, password is last 4 digits of phone
        const expectedPassword = phone.slice(-4);
        
        if (password !== expectedPassword) {
            return { 
                success: false, 
                message: 'Invalid password. Use last 4 digits of your phone number.' 
            };
        }

        const authData = {
            isLoggedIn: true,
            timestamp: Date.now(),
            userId: patient.id,
            userName: patient.name,
            phone: patient.phone,
            email: patient.email,
            gender: patient.gender,
            role: 'patient'
        };
        
        localStorage.setItem(this.AUTH_KEYS.PATIENT, JSON.stringify(authData));
        localStorage.setItem(this.AUTH_KEYS.CURRENT_USER, JSON.stringify(authData));
        return { success: true, user: authData };
    },

    // Doctor Login (using email)
    loginDoctor(email, password) {
        const doctors = Storage.getDoctors();
        const doctor = doctors.find(d => d.email && d.email.toLowerCase() === email.toLowerCase());
        
        if (!doctor) {
            return { 
                success: false, 
                message: 'Doctor not found with this email.' 
            };
        }

        // For demo purposes, password is "doc" + doctor.id
        const expectedPassword = 'doc' + doctor.id;
        
        if (password !== expectedPassword) {
            return { 
                success: false, 
                message: `Invalid password. Use: doc${doctor.id}` 
            };
        }

        const authData = {
            isLoggedIn: true,
            timestamp: Date.now(),
            userId: doctor.id,
            userName: doctor.name,
            email: doctor.email,
            specialty: doctor.specialty,
            shift: doctor.shift,
            role: 'doctor'
        };
        
        localStorage.setItem(this.AUTH_KEYS.DOCTOR, JSON.stringify(authData));
        localStorage.setItem(this.AUTH_KEYS.CURRENT_USER, JSON.stringify(authData));
        return { success: true, user: authData };
    },

    // Logout (all roles)
    logout() {
        localStorage.removeItem(this.AUTH_KEYS.ADMIN);
        localStorage.removeItem(this.AUTH_KEYS.PATIENT);
        localStorage.removeItem(this.AUTH_KEYS.DOCTOR);
        localStorage.removeItem(this.AUTH_KEYS.CURRENT_USER);
        window.location.href = '/index.html';
    },

    // Logout Patient
    logoutPatient() {
        localStorage.removeItem(this.AUTH_KEYS.PATIENT);
        localStorage.removeItem(this.AUTH_KEYS.CURRENT_USER);
        window.location.href = '../pages/login.html';
    },

    // Logout Doctor
    logoutDoctor() {
        localStorage.removeItem(this.AUTH_KEYS.DOCTOR);
        localStorage.removeItem(this.AUTH_KEYS.CURRENT_USER);
        window.location.href = 'login.html';
    },

    // Get current user (any role)
    getCurrentUser() {
        const userData = localStorage.getItem(this.AUTH_KEYS.CURRENT_USER);
        if (!userData) return null;
        
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    },

    // Get current patient
    getCurrentPatient() {
        const user = this.getCurrentUser();
        return (user && user.role === 'patient') ? user : null;
    },

    // Get current doctor
    getCurrentDoctor() {
        const user = this.getCurrentUser();
        return (user && user.role === 'doctor') ? user : null;
    },

    // Get current admin
    getCurrentAdmin() {
        const user = this.getCurrentUser();
        return (user && user.role === 'admin') ? user : null;
    },

    // Protect page (redirect if not authenticated or wrong role)
    protectPage(requiredRole = null) {
        const user = this.getCurrentUser();
        
        if (!user) {
            const redirectUrl = window.location.pathname.includes('/pages/') 
                ? 'login.html' 
                : 'pages/login.html';
            window.location.href = redirectUrl;
            return false;
        }

        if (requiredRole && user.role !== requiredRole) {
            Utils.showToast('Access denied. You don\'t have permission to access this page.', 'error');
            setTimeout(() => {
                if (user.role === 'patient') {
                    window.location.href = 'dashboard-patient.html';
                } else if (user.role === 'doctor') {
                    window.location.href = 'dashboard-doctor.html';
                } else if (user.role === 'admin') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
            }, 1500);
            return false;
        }

        return true;
    }
};

// Handle login form submission
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginType = document.getElementById('login-type');
    
    // Update form fields based on login type
    if (loginType) {
        loginType.addEventListener('change', () => {
            updateLoginFormFields();
        });
        updateLoginFormFields();
    }

    function updateLoginFormFields() {
        const type = loginType.value;
        const usernameGroup = document.getElementById('username-group');
        const emailGroup = document.getElementById('email-group');
        const phoneGroup = document.getElementById('phone-group');
        const passwordLabel = document.querySelector('label[for="password"]');
        const passwordHelp = document.getElementById('password-help');

        if (type === 'admin') {
            if (usernameGroup) usernameGroup.style.display = 'block';
            if (emailGroup) emailGroup.style.display = 'none';
            if (phoneGroup) phoneGroup.style.display = 'none';
            if (passwordLabel) passwordLabel.textContent = 'Password';
            if (passwordHelp) passwordHelp.textContent = 'Demo: admin123';
        } else if (type === 'patient') {
            if (usernameGroup) usernameGroup.style.display = 'none';
            if (emailGroup) emailGroup.style.display = 'none';
            if (phoneGroup) phoneGroup.style.display = 'block';
            if (passwordLabel) passwordLabel.textContent = 'Password';
            if (passwordHelp) passwordHelp.textContent = 'Use last 4 digits of your phone number';
        } else if (type === 'doctor') {
            if (usernameGroup) usernameGroup.style.display = 'none';
            if (emailGroup) emailGroup.style.display = 'block';
            if (phoneGroup) phoneGroup.style.display = 'none';
            if (passwordLabel) passwordLabel.textContent = 'Password';
            if (passwordHelp) passwordHelp.textContent = 'Use: doc[doctor_id] (e.g., doc2)';
        }
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const type = loginType ? loginType.value : 'admin';
            const password = document.getElementById('password').value;
            
            let result;
            
            if (type === 'admin') {
                const username = document.getElementById('username').value.trim();
                if (!username || !password) {
                    Utils.showToast('Please enter both username and password', 'error');
                    return;
                }
                result = Auth.loginAdmin(username, password);
                
                if (result.success) {
                    Utils.showToast('Admin login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    Utils.showToast(result.message, 'error');
                    document.getElementById('password').value = '';
                }
            } else if (type === 'patient') {
                const phone = document.getElementById('phone').value.trim();
                if (!phone || !password) {
                    Utils.showToast('Please enter both phone number and password', 'error');
                    return;
                }
                result = Auth.loginPatient(phone, password);
                
                if (result.success) {
                    Utils.showToast(`Welcome back, ${result.user.userName}!`, 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard-patient.html';
                    }, 1000);
                } else {
                    Utils.showToast(result.message, 'error');
                    document.getElementById('password').value = '';
                }
            } else if (type === 'doctor') {
                const email = document.getElementById('email').value.trim();
                if (!email || !password) {
                    Utils.showToast('Please enter both email and password', 'error');
                    return;
                }
                result = Auth.loginDoctor(email, password);
                
                if (result.success) {
                    Utils.showToast(`Welcome, Dr. ${result.user.userName}!`, 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard-doctor.html';
                    }, 1000);
                } else {
                    Utils.showToast(result.message, 'error');
                    document.getElementById('password').value = '';
                }
            }
        });
    }

    // Handle logout buttons
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (Utils.confirm('Are you sure you want to logout?')) {
                Auth.logout();
            }
        });
    }

    // Update navbar based on login status
    updateNavbarForAuth();
});

// Update navbar to show login/logout based on auth status
function updateNavbarForAuth() {
    setTimeout(() => {
        const user = Auth.getCurrentUser();
        const navbarMenu = document.getElementById('navbar-menu');
        
        if (!navbarMenu) return;

        // Find or create user section in navbar
        let userSection = navbarMenu.querySelector('.user-section');
        
        if (user) {
            // User is logged in
            if (!userSection) {
                userSection = document.createElement('div');
                userSection.className = 'user-section';
                userSection.style.cssText = 'display: flex; align-items: center; gap: 1rem; margin-left: auto;';
                navbarMenu.appendChild(userSection);
            }

            const roleLabel = user.role === 'patient' ? '👤 Patient' : 
                            user.role === 'doctor' ? '👨‍⚕️ Doctor' : 
                            '🔐 Admin';

            userSection.innerHTML = `
                <span class="user-info" style="color: var(--text-color); font-size: 0.9rem;">
                    ${roleLabel}: ${user.userName}
                </span>
                <button id="navbar-logout-btn" class="btn btn-danger btn-sm" style="padding: 6px 12px; font-size: 0.875rem;">
                    Logout
                </button>
            `;

            // Add logout handler
            const navLogoutBtn = document.getElementById('navbar-logout-btn');
            if (navLogoutBtn) {
                navLogoutBtn.addEventListener('click', () => {
                    if (Utils.confirm('Are you sure you want to logout?')) {
                        Auth.logout();
                    }
                });
            }

            // Hide admin link if user is logged in
            const adminLink = navbarMenu.querySelector('.nav-link-admin');
            if (adminLink) {
                adminLink.style.display = 'none';
            }
        } else {
            // User not logged in - remove user section if exists
            if (userSection) {
                userSection.remove();
            }
        }
    }, 100);
}