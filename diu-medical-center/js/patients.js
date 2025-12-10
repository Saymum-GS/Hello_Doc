/* ========================================
   PATIENTS.JS - Patient Registration (COMPLETE FIX)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    
    if (!registrationForm) return;

    const dobInput = document.getElementById('patient-dob');
    if (dobInput) {
        dobInput.max = Utils.getTodayDate();
    }

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('patient-name').value.trim(),
            phone: document.getElementById('patient-phone').value.trim(),
            email: document.getElementById('patient-email').value.trim(),
            gender: document.getElementById('patient-gender').value,
            dob: document.getElementById('patient-dob').value,
            address: document.getElementById('patient-address')?.value.trim() || ''
        };

        const validation = Validation.validatePatient(formData);
        if (!validation.isValid) {
            Validation.showErrors(validation.errors);
            return;
        }

        const existingPatient = Storage.getPatientByPhone(formData.phone);
        if (existingPatient) {
            Utils.showToast('Phone number already registered. Please login instead.', 'error');
            setTimeout(() => {
                if (confirm('This phone number is already registered. Would you like to go to login page?')) {
                    window.location.href = 'login.html';
                }
            }, 1500);
            return;
        }

        const patients = Storage.getPatients();
        const emailExists = patients.some(p => p.email.toLowerCase() === formData.email.toLowerCase());
        if (emailExists) {
            Utils.showToast('Email already registered', 'error');
            return;
        }

        try {
            const newPatient = Storage.addPatient(formData);
            Utils.showToast('Registration successful!', 'success');
            
            // Auto-login after registration
            setTimeout(() => {
                if (typeof Auth !== 'undefined') {
                    const lastFourDigits = formData.phone.slice(-4);
                    const loginResult = Auth.loginPatient(formData.phone, lastFourDigits);
                    
                    if (loginResult.success) {
                        Utils.showToast(`Welcome, ${newPatient.name}! Redirecting to your dashboard...`, 'info');
                        
                        setTimeout(() => {
                            window.location.href = 'dashboard-patient.html';
                        }, 1500);
                    } else {
                        // If auto-login fails, just redirect to login page
                        Utils.showToast('Please login with your credentials', 'info');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1500);
                    }
                } else {
                    // Auth not loaded, redirect to login
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                }
            }, 1000);
            
            registrationForm.reset();
            
        } catch (error) {
            console.error('Registration error:', error);
            Utils.showToast('Registration failed. Please try again.', 'error');
        }
    });
});

