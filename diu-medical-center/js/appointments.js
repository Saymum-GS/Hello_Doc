/* ========================================
   APPOINTMENTS.JS - Appointment Booking (FIXED v2)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = document.getElementById('appointment-form');
    
    if (!appointmentForm) return;

    const patientSelect = document.getElementById('patient-select');
    const doctorSelect = document.getElementById('doctor-select');
    const doctorInfo = document.getElementById('doctor-info');
    const appointmentDate = document.getElementById('appointment-date');
    const appointmentTime = document.getElementById('appointment-time');

    // Get current user
    const currentUser = Auth.getCurrentUser();
    const currentPatient = (currentUser && currentUser.role === 'patient') ? currentUser : null;
    
    // Load initial data
    loadPatients();
    loadDoctors();

    // Set min date
    if (appointmentDate) {
        appointmentDate.min = Utils.getTodayDate();
    }

    // Pre-select doctor from URL
    const preSelectedDoctor = Utils.getUrlParameter('doctor');
    if (preSelectedDoctor && doctorSelect) {
        setTimeout(() => {
            doctorSelect.value = preSelectedDoctor;
            handleDoctorChange();
        }, 300);
    }

    // Event listeners
    if (doctorSelect) {
        doctorSelect.addEventListener('change', handleDoctorChange);
    }

    if (appointmentDate) {
        appointmentDate.addEventListener('change', () => {
            if (doctorSelect && doctorSelect.value) {
                loadAvailableTimeSlots();
            }
        });
    }

    appointmentForm.addEventListener('submit', handleFormSubmit);

    function loadPatients() {
        if (!patientSelect) return;
        
        const patients = Storage.getPatients();
        
        if (patients.length === 0) {
            patientSelect.innerHTML = '<option value="">No patients registered</option>';
            return;
        }

        if (currentPatient) {
            patientSelect.innerHTML = `<option value="${currentPatient.userId}" selected>${currentPatient.userName}</option>`;
            patientSelect.disabled = true;
        } else {
            patientSelect.innerHTML = '<option value="">Select patient</option>' +
                patients.map(p => `<option value="${p.id}">${p.name} (${p.phone})</option>`).join('');
        }
    }

    function loadDoctors() {
        if (!doctorSelect) return;
        
        const doctors = Storage.getDoctors();
        
        doctorSelect.innerHTML = '<option value="">Select doctor</option>' +
            doctors.map(d => {
                const shift = d.shift === 'day' ? 'Day (9-4)' : 'Evening (4-12)';
                return `<option value="${d.id}">${d.name} - ${d.specialty}</option>`;
            }).join('');
    }

    function handleDoctorChange() {
        if (!doctorSelect || !doctorInfo || !appointmentTime) return;
        
        const doctorId = doctorSelect.value;
        
        if (!doctorId) {
            if (doctorInfo) doctorInfo.style.display = 'none';
            if (appointmentTime) appointmentTime.innerHTML = '<option value="">Select time</option>';
            return;
        }

        const doctor = Storage.getDoctorById(parseInt(doctorId));
        if (!doctor) return;

        const shiftTime = doctor.shift === 'day' ? '9:00 AM - 4:00 PM' : '4:00 PM - 11:59 PM';

        if (doctorInfo) {
            doctorInfo.style.display = 'block';
            doctorInfo.innerHTML = `
                <h4>Dr. ${doctor.name}</h4>
                <p><strong>Specialty:</strong> ${doctor.specialty}</p>
                <p><strong>Experience:</strong> ${doctor.experience} years</p>
                <p><strong>Hours:</strong> ${shiftTime}</p>
            `;
        }

        if (appointmentDate && appointmentDate.value) {
            loadAvailableTimeSlots();
        }
    }

    function loadAvailableTimeSlots() {
        if (!doctorSelect || !appointmentDate || !appointmentTime) return;
        
        const doctorId = doctorSelect.value;
        const date = appointmentDate.value;

        if (!doctorId || !date) return;

        const doctor = Storage.getDoctorById(parseInt(doctorId));
        if (!doctor) return;

        if (!Validation.validateFutureDate(date)) {
            appointmentTime.innerHTML = '<option value="">Select future date</option>';
            return;
        }

        const timeSlots = Utils.generateTimeSlots(doctor.timings.start, doctor.timings.end, 30);
        
        const availableSlots = timeSlots.filter(slot => {
            return Storage.isSlotAvailable(parseInt(doctorId), date, slot);
        });

        if (availableSlots.length === 0) {
            appointmentTime.innerHTML = '<option value="">No slots available</option>';
            return;
        }

        appointmentTime.innerHTML = '<option value="">Select time</option>' +
            availableSlots.map(slot => `<option value="${slot}">${Utils.formatTime(slot)}</option>`).join('');
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        if (!patientSelect || !doctorSelect || !appointmentDate || !appointmentTime) {
            Utils.showToast('Form incomplete', 'error');
            return;
        }

        const reasonField = document.getElementById('appointment-reason');
        if (!reasonField) {
            Utils.showToast('Reason field missing', 'error');
            return;
        }

        const patientId = parseInt(patientSelect.value);
        const doctorId = parseInt(doctorSelect.value);
        const date = appointmentDate.value;
        const time = appointmentTime.value;
        const reason = reasonField.value.trim();

        if (!patientId || !doctorId || !date || !time || !reason) {
            Utils.showToast('Please fill all fields', 'error');
            return;
        }

        const appointmentData = {
            patientId: patientId,
            doctorId: doctorId,
            date: date,
            time: time,
            reason: reason,
            status: 'scheduled'
        };

        const validation = Validation.validateAppointment(appointmentData);
        if (!validation.isValid) {
            Validation.showErrors(validation.errors);
            return;
        }

        if (!Validation.validateFutureDate(date)) {
            Utils.showToast('Date must be in future', 'error');
            return;
        }

        if (!Storage.isSlotAvailable(doctorId, date, time)) {
            Utils.showToast('Slot no longer available', 'error');
            loadAvailableTimeSlots();
            return;
        }

        try {
            const appointment = Storage.addAppointment(appointmentData);
            const patient = Storage.getPatientById(patientId);
            const doctor = Storage.getDoctorById(doctorId);

            if (!patient || !doctor) {
                Utils.showToast('Error loading data', 'error');
                return;
            }

            Utils.showToast('Appointment booked!', 'success');

            setTimeout(() => {
                if (Utils.confirm('Appointment confirmed. Go to dashboard?')) {
                    if (currentPatient) {
                        window.location.href = 'dashboard-patient.html';
                    } else {
                        window.location.href = 'lookup.html';
                    }
                }
            }, 500);
            
        } catch (error) {
            console.error('Booking error:', error);
            Utils.showToast('Booking failed', 'error');
        }
    }
});

