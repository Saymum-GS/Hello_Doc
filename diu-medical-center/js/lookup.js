/* ========================================
   LOOKUP.JS - Appointment Lookup (FIXED v2)
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('lookup-form');
    const resultDiv = document.getElementById('appointments-result');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('lookup-phone').value.trim();
        
        if (!Validation.validatePhone(phone)) {
            Utils.showToast('Invalid phone number', 'error');
            return;
        }

        const patients = Storage.getPatients();
        const patient = patients.find(p => p.phone === phone);

        if (!patient) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="error-message">
                    <h3>Patient Not Found</h3>
                    <p>No patient with this phone number.</p>
                    <p><a href="register.html">Register here</a></p>
                </div>
            `;
            return;
        }

        const appointments = Storage.getAppointments();
        const doctors = Storage.getDoctors();
        const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);

        if (patientAppointments.length === 0) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="info-message">
                    <h3>No Appointments</h3>
                    <p>Hello ${patient.name}, you have no appointments.</p>
                    <p><a href="book.html">Book one</a></p>
                </div>
            `;
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = patientAppointments
            .filter(a => {
                const aptDate = new Date(a.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate >= today && a.status !== 'cancelled';
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const past = patientAppointments
            .filter(a => {
                const aptDate = new Date(a.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate < today || a.status === 'cancelled';
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = `
            <div class="success-message">
                <h3>Welcome, ${patient.name}</h3>
                <p>${patient.email} | ${patient.phone}</p>
            </div>
            <div class="appointments-list">
        `;

        if (upcoming.length > 0) {
            html += `<h4>📅 Upcoming Appointments</h4>`;
            upcoming.forEach(a => {
                const doc = doctors.find(d => d.id === a.doctorId);
                html += `
                    <div class="appointment-card">
                        <div class="appointment-header">
                            <h4>Dr. ${doc ? doc.name : 'Unknown'}</h4>
                            <span class="badge badge-success">${a.status.toUpperCase()}</span>
                        </div>
                        <div class="appointment-details">
                            <p><strong>Specialty:</strong> ${doc ? doc.specialty : 'N/A'}</p>
                            <p><strong>Date:</strong> ${Utils.formatDate(a.date)}</p>
                            <p><strong>Time:</strong> ${Utils.formatTime(a.time)}</p>
                            <p><strong>Reason:</strong> ${a.reason}</p>
                        </div>
                    </div>
                `;
            });
        }

        if (past.length > 0) {
            html += `<h4>📋 Past Appointments</h4>`;
            past.forEach(a => {
                const doc = doctors.find(d => d.id === a.doctorId);
                const badgeClass = a.status === 'cancelled' ? 'badge-danger' : 'badge-secondary';

                html += `
                    <div class="appointment-card past">
                        <div class="appointment-header">
                            <h4>Dr. ${doc ? doc.name : 'Unknown'}</h4>
                            <span class="badge ${badgeClass}">${a.status.toUpperCase()}</span>
                        </div>
                        <div class="appointment-details">
                            <p><strong>Specialty:</strong> ${doc ? doc.specialty : 'N/A'}</p>
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
    });
});

