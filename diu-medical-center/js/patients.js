/* ========================================
   PATIENTS.JS - Patient Registration Logic
   Handles patient registration with auto-login
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    
    if (!registrationForm) return;

    // Set max date for DOB (today)
    const dobInput = document.getElementById('patient-dob');
    if (dobInput) {
        dobInput.max = Utils.getTodayDate();
    }

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('patient-name').value.trim(),
            phone: document.getElementById('patient-phone').value.trim(),
            email: document.getElementById('patient-email').value.trim(),
            gender: document.getElementById('patient-gender').value,
            dob: document.getElementById('patient-dob').value,
            address: document.getElementById('patient-address')?.value.trim() || ''
        };

        // Validate form data
        const validation = Validation.validatePatient(formData);
        if (!validation.isValid) {
            Validation.showErrors(validation.errors);
            return;
        }

        // Check if phone number already exists
        const existingPatient = Storage.getPatientByPhone(formData.phone);
        if (existingPatient) {
            Utils.showToast('A patient with this phone number already exists. Please login.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // Check if email already exists
        const patients = Storage.getPatients();
        const emailExists = patients.some(
            p => p.email.toLowerCase() === formData.email.toLowerCase()
        );
        if (emailExists) {
            Utils.showToast('A patient with this email already exists', 'error');
            return;
        }

        // Add patient to storage
        try {
            const newPatient = Storage.addPatient(formData);
            Utils.showToast(`Registration successful! Welcome, ${newPatient.name}`, 'success');
            
            // Auto-login the patient
            const lastFourDigits = formData.phone.slice(-4);
            const loginResult = Auth.loginPatient(formData.phone, lastFourDigits);
            
            if (loginResult.success) {
                Utils.showToast(
                    `You are now logged in. Your password is the last 4 digits of your phone: ${lastFourDigits}`,
                    'info'
                );
                
                // Reset form
                registrationForm.reset();

                // Redirect to booking page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'book.html';
                }, 2000);
            }
            
        } catch (error) {
            console.error('Error registering patient:', error);
            Utils.showToast('An error occurred during registration. Please try again.', 'error');
        }
    });
});
