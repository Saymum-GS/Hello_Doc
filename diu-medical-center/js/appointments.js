/* ========================================
   APPOINTMENTS.JS - Appointment Booking Logic
   Handles appointment booking with proper validation
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = document.getElementById('appointment-form');
    
    if (!appointmentForm) return;

    const patientSelect = document.getElementById('patient-select');
    const doctorSelect = document.getElementById('doctor-select');
    const doctorInfo = document.getElementById('doctor-info');
    const appointmentDate = document.getElementById('appointment-date');
    const appointmentTime = document.getElementById('appointment-time');

    // Check if patient is logged in
    const currentPatient = Auth.getCurrentPatient();
    
    // Load patients
    loadPatients();

    // Load doctors
    loadDoctors();

    // Set min date to today
    if (appointmentDate) {
        appointmentDate.min = Utils.getTodayDate();
    }

    // Check URL params for pre-selected doctor
    const preSelectedDoctor = Utils.getUrlParameter('doctor');
    if (preSelectedDoctor && doctorSelect) {
        doctorSelect.value = preSelectedDoctor;
        handleDoctorChange();
    }

    // Handle doctor selection change
    if (doctorSelect) {
        doctorSelect.addEventListener('change', handleDoctorChange);
    }

    // Handle date change
    if (appointmentDate) {
        appointmentDate.addEventListener('change', () => {
            if (doctorSelect && doctorSelect.value) {
                loadAvailableTimeSlots();
            }
        });
    }

    // Handle form submission
    appointmentForm.addEventListener('submit', handleFormSubmit);

    // Load patients into select
    function loadPatients() {
        if (!patientSelect) return;
        
        const patients = Storage.getPatients();
        
        if (patients.length === 0) {
            patientSelect.innerHTML = '<option value="">No patients registered</option>';
            return;
        }

        // If patient is logged in, pre-select them
        if (currentPatient) {
            patientSelect.innerHTML = `<option value="${currentPatient.userId}" selected>${currentPatient.userName} - ${currentPatient.phone}</option>`;
            patientSelect.disabled = true;
        } else {
            patientSelect.innerHTML = '<option value="">Choose a patient</option>' +
                patients.map(patient => 
                    `<option value="${patient.id}">${patient.name} - ${patient.phone}</option>`
                ).join('');
        }
    }

    // Load doctors into select
    function loadDoctors() {
        if (!doctorSelect) return;
        
        const doctors = Storage.getDoctors();
        
        doctorSelect.innerHTML = '<option value="">Choose a doctor</option>' +
            doctors.map(doctor => 
                `<option value="${doctor.id}">${doctor.name} - ${doctor.specialty} (${doctor.shift === 'day' ? 'Day' : 'Evening'} Shift)</option>`
            ).join('');
    }

    // Handle doctor selection
    function handleDoctorChange() {
        if (!doctorSelect || !doctorInfo || !appointmentTime) return;
        
        const doctorId = doctorSelect.value;
        
        if (!doctorId) {
            doctorInfo.style.display = 'none';
            appointmentTime.innerHTML = '<option value="">Select time</option>';
            return;
        }

        const doctor = Storage.getDoctorById(parseInt(doctorId));
        if (!doctor) return;

        // Display doctor info
        doctorInfo.style.display = 'block';
        doctorInfo.innerHTML = `
            <h4>${doctor.name}</h4>
            <p><strong>Specialty:</strong> ${doctor.specialty}</p>
            <p><strong>Qualification:</strong> ${doctor.qualification}</p>
            <p><strong>Experience:</strong> ${doctor.experience} years</p>
            <p><strong>Shift:</strong> ${Utils.getShiftBadge(doctor.shift)}</p>
            <p><strong>Available Hours:</strong> ${Utils.formatShiftTime(doctor.shift)}</p>
            ${doctor.email ? `<p><strong>Email:</strong> ${doctor.email}</p>` : ''}
        `;

        // Load time slots if date is selected
        if (appointmentDate && appointmentDate.value) {
            loadAvailableTimeSlots();
        }
    }

    // Load available time slots
    function loadAvailableTimeSlots() {
        if (!doctorSelect || !appointmentDate || !appointmentTime) return;
        
        const doctorId = doctorSelect.value;
        const date = appointmentDate.value;

        if (!doctorId || !date) return;

        const doctor = Storage.getDoctorById(parseInt(doctorId));
        if (!doctor) return;

        // Check if selected date is valid
        if (!Validation.validateFutureDate(date)) {
            appointmentTime.innerHTML = '<option value="">Please select a future date</option>';
            Utils.showToast('Please select a future date', 'warning');
            return;
        }

        // Generate time slots based on doctor's shift (30-minute intervals)
        const timeSlots = Utils.generateTimeSlots(doctor.timings.start, doctor.timings.end, 30);
        
        // Filter out booked slots
        const availableSlots = timeSlots.filter(slot => {
            return Storage.isSlotAvailable(parseInt(doctorId), date, slot);
        });

        if (availableSlots.length === 0) {
            appointmentTime.innerHTML = '<option value="">No available slots for this date</option>';
            Utils.showToast('No available time slots for this date. Please choose another date.', 'warning');
            return;
        }

        appointmentTime.innerHTML = '<option value="">Select time</option>' +
            availableSlots.map(slot => 
                `<option value="${slot}">${Utils.formatTime(slot)}</option>`
            ).join('');

        Utils.showToast(`${availableSlots.length} time slots available`, 'info');
    }

    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();

        if (!patientSelect || !doctorSelect || !appointmentDate || !appointmentTime) {
            Utils.showToast('Form elements not found', 'error');
            return;
        }

        const reasonField = document.getElementById('appointment-reason');
        if (!reasonField) {
            Utils.showToast('Reason field not found', 'error');
            return;
        }

        const appointmentData = {
            patientId: parseInt(patientSelect.value),
            doctorId: parseInt(doctorSelect.value),
            date: appointmentDate.value,
            time: appointmentTime.value,
            reason: reasonField.value.trim(),
            status: 'scheduled'
        };

        // Validate appointment
        const validation = Validation.validateAppointment(appointmentData);
        
        if (!validation.isValid) {
            Validation.showErrors(validation.errors);
            return;
        }

        // Additional validation: Check if date is in the future
        if (!Validation.validateFutureDate(appointmentData.date)) {
            Utils.showToast('Appointment date must be in the future', 'error');
            return;
        }

        // Check if slot is still available
        if (!Storage.isSlotAvailable(appointmentData.doctorId, appointmentData.date, appointmentData.time)) {
            Utils.showToast('This time slot is no longer available. Please choose another time.', 'error');
            loadAvailableTimeSlots();
            return;
        }

        // Add appointment
        try {
            const appointment = Storage.addAppointment(appointmentData);
            const patient = Storage.getPatientById(appointmentData.patientId);
            const doctor = Storage.getDoctorById(appointmentData.doctorId);

            if (!patient || !doctor) {
                Utils.showToast('Error loading patient or doctor data', 'error');
                return;
            }

            Utils.showToast('Appointment booked successfully!', 'success');

            // Show confirmation
            setTimeout(() => {
                const confirmMessage = `✅ Appointment Confirmed!

📋 Appointment Details:
━━━━━━━━━━━━━━━━━━━━
👤 Patient: ${patient.name}
📞 Phone: ${patient.phone}
👨‍⚕️ Doctor: ${doctor.name}
🏥 Specialty: ${doctor.specialty}
🕐 Shift: ${doctor.shift === 'day' ? 'Day (9 AM - 4 PM)' : 'Evening (4 PM - 12 AM)'}
📅 Date: ${Utils.formatDate(appointment.date)}
⏰ Time: ${Utils.formatTime(appointment.time)}
📝 Reason: ${appointment.reason}

⚠️ Important:
- Please arrive 10 minutes before your appointment
- Bring any relevant medical documents
- Contact: 01847140120

Click OK to continue.`;

                if (Utils.confirm(confirmMessage)) {
                    // Reset form
                    appointmentForm.reset();
                    if (doctorInfo) doctorInfo.style.display = 'none';
                    
                    // Reload if not logged in patient
                    if (!currentPatient) {
                        loadPatients();
                        loadDoctors();
                    }
                    
                    // Redirect to lookup page
                    setTimeout(() => {
                        window.location.href = 'lookup.html';
                    }, 500);
                }
            }, 500);
            
        } catch (error) {
            console.error('Error booking appointment:', error);
            Utils.showToast('An error occurred while booking. Please try again.', 'error');
        }
    }
});