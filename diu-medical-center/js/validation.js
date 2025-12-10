/* ========================================
   VALIDATION.JS - Form Validation (FIXED)
   Handles all form validation logic
   ======================================== */

const Validation = {
    // Validate phone number (10-11 digits, supports formatting)
    validatePhone(phone) {
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');
        // Accept 10-11 digits (Bangladesh numbers)
        return digits.length >= 10 && digits.length <= 11;
    },

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate date (must be future date)
    validateFutureDate(dateString) {
        const inputDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today;
    },

    // Validate time format (24-hour)
    validateTime(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    },

    // Validate required field
    validateRequired(value) {
        return value && value.trim().length > 0;
    },

    // Validate name (allows letters, spaces, hyphens, apostrophes)
    validateName(name) {
        const nameRegex = /^[a-zA-Z\s\-'\.]{2,100}$/;
        return nameRegex.test(name.trim());
    },

    // Validate date of birth (must be past date, reasonable age)
    validateDOB(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return birthDate < today && age >= 0 && age <= 150;
    },

    // Check if time is within doctor's shift hours
    isTimeInShift(time, doctorTimings) {
        const [hours, minutes] = time.split(':').map(Number);
        const [startHours, startMinutes] = doctorTimings.start.split(':').map(Number);
        const [endHours, endMinutes] = doctorTimings.end.split(':').map(Number);
        
        const timeInMinutes = hours * 60 + minutes;
        const startInMinutes = startHours * 60 + startMinutes;
        const endInMinutes = endHours * 60 + endMinutes;

        // Both times on same day
        return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
    },

    // Validate appointment booking
    validateAppointment(data) {
        const errors = [];

        if (!this.validateRequired(String(data.patientId))) {
            errors.push('Please select a patient');
        }

        if (!this.validateRequired(String(data.doctorId))) {
            errors.push('Please select a doctor');
        }

        if (!this.validateRequired(data.date)) {
            errors.push('Please select a date');
        } else if (!this.validateFutureDate(data.date)) {
            errors.push('Appointment date must be in the future');
        }

        if (!this.validateRequired(data.time)) {
            errors.push('Please select a time');
        } else if (!this.validateTime(data.time)) {
            errors.push('Invalid time format');
        }

        if (!this.validateRequired(data.reason)) {
            errors.push('Please provide a reason for visit');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Validate patient registration
    validatePatient(data) {
        const errors = [];

        if (!this.validateRequired(data.name)) {
            errors.push('Name is required');
        } else if (!this.validateName(data.name)) {
            errors.push('Name must contain 2-100 characters (letters, spaces, hyphens, apostrophes)');
        }

        if (!this.validateRequired(data.phone)) {
            errors.push('Phone number is required');
        } else if (!this.validatePhone(data.phone)) {
            errors.push('Phone number must be 10-11 digits');
        }

        if (!this.validateRequired(data.email)) {
            errors.push('Email is required');
        } else if (!this.validateEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!this.validateRequired(data.gender)) {
            errors.push('Gender is required');
        }

        if (!this.validateRequired(data.dob)) {
            errors.push('Date of birth is required');
        } else if (!this.validateDOB(data.dob)) {
            errors.push('Please enter a valid date of birth');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Show validation errors
    showErrors(errors) {
        errors.forEach(error => {
            Utils.showToast(error, 'error');
        });
    }
};