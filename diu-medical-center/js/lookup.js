/* ========================================
   LOOKUP.JS - Appointment Lookup Logic
   Handles patient appointment lookup
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('lookup-form');
    const resultDiv = document.getElementById('appointments-result');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('lookup-phone').value.trim();
        
        // Validate phone
        if (!Validation.validatePhone(phone)) {
            Utils.showToast('Please enter a valid 10-11 digit phone number', 'error');
            return;
        }

        // Find patient
        const patients = Storage.getPatients();
        const patient = patients.find(p => p.phone === phone);

        if (!patient) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="error-message">
                    <h3>No Patient Found</h3>
                    <p>No registered patient exists with this phone number.</p>
                    <p>Please <a href="register.html">register</a> first.</p>
                </div>
            `;
            return;
        }

        // Find appointments
        const appointments = Storage.getAppointments();
        const doctors = Storage.getDoctors();
        const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);

        if (patientAppointments.length === 0) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="info-message">
                    <h3>No Appointments Found</h3>
                    <p>Hello ${patient.name}, you do not have any appointments yet.</p>
                    <p><a href="book.html">Book an appointment</a> to get started.</p>
                </div>
            `;
            return;
        }

        // Separate upcoming and past
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = patientAppointments
            .filter(a => new Date(a.date) >= today && a.status !== 'cancelled')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const past = patientAppointments
            .filter(a => new Date(a.date) < today || ['completed','cancelled'].includes(a.status))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = `
            <div class="success-message">
                <h3>Welcome, ${patient.name}!</h3>
                <p><strong>Email:</strong> ${patient.email}</p>
                <p><strong>Phone:</strong> ${patient.phone}</p>
                <p>Here are your appointment details:</p>
            </div>
            <div class="appointments-list">
        `;

        // Upcoming
        if (upcoming.length > 0) {
            html += `<h4>📅 Upcoming Appointments</h4>`;
            upcoming.forEach(a => {
                const doc = doctors.find(d => d.id === a.doctorId);
                html += `
                    <div class="appointment-card">
                        <div class="appointment-header">
                            <h4>${doc?.name || 'Unknown Doctor'}</h4>
                            <span class="badge badge-success">${a.status.toUpperCase()}</span>
                        </div>
                        <div class="appointment-details">
                            <p><strong>Specialty:</strong> ${doc?.specialty || 'N/A'}</p>
                            <p><strong>Shift:</strong> ${doc ? Utils.getShiftBadge(doc.shift) : 'N/A'}</p>
                            <p><strong>Date:</strong> ${Utils.formatDate(a.date)}</p>
                            <p><strong>Time:</strong> ${Utils.formatTime(a.time)}</p>
                            <p><strong>Reason:</strong> ${a.reason}</p>
                        </div>
                    </div>
                `;
            });
        }

        // Past
        if (past.length > 0) {
            html += `<h4>📋 Past Appointments</h4>`;
            past.forEach(a => {
                const doc = doctors.find(d => d.id === a.doctorId);
                const badgeClass = a.status === 'cancelled' ? 'badge-danger' : 'badge-secondary';

                html += `
                    <div class="appointment-card past">
                        <div class="appointment-header">
                            <h4>${doc?.name || 'Unknown Doctor'}</h4>
                            <span class="badge ${badgeClass}">${a.status.toUpperCase()}</span>
                        </div>
                        <div class="appointment-details">
                            <p><strong>Specialty:</strong> ${doc?.specialty || 'N/A'}</p>
                            <p><strong>Date:</strong> ${Utils.formatDate(a.date)}</p>
                            <p><strong>Time:</strong> ${Utils.formatTime(a.time)}</p>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = html;

        Utils.showToast('Appointments loaded successfully', 'success');
    });
});
