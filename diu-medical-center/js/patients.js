/* ========================================
   PATIENTS.JS - Patient Registration (FIXED v2)
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
            Utils.showToast('Phone number already registered', 'error');
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
            
            const lastFourDigits = formData.phone.slice(-4);
            const loginResult = Auth.loginPatient(formData.phone, lastFourDigits);
            
            if (loginResult.success) {
                Utils.showToast('Logged in! Redirecting...', 'info');
                registrationForm.reset();

                setTimeout(() => {
                    window.location.href = 'dashboard-patient.html';
                }, 1000);
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            Utils.showToast('Registration failed', 'error');
        }
    });
});

