/* ========================================
   VALIDATION.JS - Form Validation
   Handles all form validation logic
   ======================================== */

const Validation = {
    // Validate phone number (10-11 digits)
    validatePhone(phone) {
        const phoneRegex = /^\d{10,11}$/;
        return phoneRegex.test(phone);
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

    // Validate name (only letters and spaces)
    validateName(name) {
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name);
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
        const [hours] = time.split(':').map(Number);
        const [startHours] = doctorTimings.start.split(':').map(Number);
        const [endHours] = doctorTimings.end.split(':').map(Number);
        
        // Handle overnight shifts (evening shift goes to midnight/24:00)
        if (endHours === 24 || endHours === 0) {
            return hours >= startHours || hours < endHours;
        }
        
        return hours >= startHours && hours < endHours;
    },

    // Validate appointment booking
    validateAppointment(data) {
        const errors = [];

        if (!this.validateRequired(data.patientId)) {
            errors.push('Please select a patient');
        }

        if (!this.validateRequired(data.doctorId)) {
            errors.push('Please select a doctor');
        }

        if (!this.validateRequired(data.date)) {
            errors.push('Please select a date');
        } else if (!this.validateFutureDate(data.date)) {
            errors.push('Appointment date must be in the future');
        }

        if (!this.validateRequired(data.time)) {
            errors.push('Please select a time');
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
            errors.push('Name must contain only letters and spaces (2-50 characters)');
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