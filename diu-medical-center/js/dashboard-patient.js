/* ========================================
   DASHBOARD-PATIENT.JS - Patient Dashboard (FIXED v2)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Protect page
    if (!Auth.protectPage('patient')) {
        return;
    }

    const currentUser = Auth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'patient') {
        window.location.href = 'login.html';
        return;
    }

    const currentPatient = currentUser;
    
    // Initialize
    initDashboard();
    displayCurrentDate();
    setupNavigation();
    loadPatientData();
    setupLogout();

    function initDashboard() {
        const welcomeDiv = document.getElementById('patient-welcome');
        if (welcomeDiv) {
            welcomeDiv.innerHTML = `
                <p>Welcome, <strong>${currentPatient.userName}</strong></p>
                <p style="color: var(--text-light); font-size: 0.9rem;">
                    ${currentPatient.email} | ${currentPatient.phone}
                </p>
            `;
        }
    }

    function displayCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const today = new Date();
            dateElement.textContent = today.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    function setupNavigation() {
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        const sections = document.querySelectorAll('.dashboard-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.dataset.section;
                
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                sections.forEach(section => {
                    section.style.display = 'none';
                });
                
                const target = document.getElementById(`${targetSection}-section`);
                if (target) {
                    target.style.display = 'block';
                }

                if (targetSection === 'profile') {
                    displayPatientProfile();
                }
            });
        });
    }

    function loadPatientData() {
        const appointments = Storage.getAppointments()
            .filter(apt => apt.patientId === currentPatient.userId);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = appointments
            .filter(apt => {
                const aptDate = new Date(apt.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate >= today && apt.status !== 'cancelled';
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const past = appointments
            .filter(apt => {
                const aptDate = new Date(apt.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate < today || apt.status === 'cancelled';
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        document.getElementById('upcoming-count').textContent = upcoming.length;
        document.getElementById('completed-count').textContent = 
            appointments.filter(apt => apt.status === 'completed').length;

        if (upcoming.length > 0) {
            displayNextAppointment(upcoming[0]);
        }

        displayUpcomingAppointments(upcoming);
        displayPastAppointments(past);
    }

    function displayNextAppointment(appointment) {
        const container = document.getElementById('next-appointment');
        const doctor = Storage.getDoctorById(appointment.doctorId);

        if (!doctor) {
            container.innerHTML = '<p class="no-data">Doctor not found</p>';
            return;
        }

        const shiftLabel = doctor.shift === 'day' ? 'Day (9 AM - 4 PM)' : 'Evening (4 PM - 12 AM)';

        container.innerHTML = `
            <div class="card" style="margin: 0;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0;">Dr. ${doctor.name}</h4>
                        <p style="margin: 0.25rem 0;"><strong>Specialty:</strong> ${doctor.specialty}</p>
                        <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${Utils.formatDate(appointment.date)}</p>
                        <p style="margin: 0.25rem 0;"><strong>Time:</strong> ${Utils.formatTime(appointment.time)}</p>
                        <p style="margin: 0.25rem 0;"><strong>Shift:</strong> ${shiftLabel}</p>
                    </div>
                    <span class="badge badge-success">${appointment.status.toUpperCase()}</span>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-sm" onclick="cancelAppointment(${appointment.id})">Cancel</button>
                </div>
            </div>
        `;
    }

    function displayUpcomingAppointments(appointments) {
        const container = document.getElementById('upcoming-appointments');

        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-data">No upcoming appointments</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => {
            const doctor = Storage.getDoctorById(apt.doctorId);
            return `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <h4>Dr. ${doctor ? doctor.name : 'Unknown'}</h4>
                        <span class="badge badge-success">${apt.status}</span>
                    </div>
                    <div class="appointment-details">
                        <p><strong>Specialty:</strong> ${doctor ? doctor.specialty : 'N/A'}</p>
                        <p><strong>Date:</strong> ${Utils.formatDate(apt.date)}</p>
                        <p><strong>Time:</strong> ${Utils.formatTime(apt.time)}</p>
                        <p><strong>Reason:</strong> ${apt.reason}</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="cancelAppointment(${apt.id})">Cancel</button>
                </div>
            `;
        }).join('');
    }

    function displayPastAppointments(appointments) {
        const container = document.getElementById('past-appointments');

        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-data">No past appointments</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => {
            const doctor = Storage.getDoctorById(apt.doctorId);
            const badgeClass = apt.status === 'cancelled' ? 'badge-danger' : 'badge-secondary';

            return `
                <div class="appointment-card past">
                    <div class="appointment-header">
                        <h4>Dr. ${doctor ? doctor.name : 'Unknown'}</h4>
                        <span class="badge ${badgeClass}">${apt.status}</span>
                    </div>
                    <div class="appointment-details">
                        <p><strong>Specialty:</strong> ${doctor ? doctor.specialty : 'N/A'}</p>
                        <p><strong>Date:</strong> ${Utils.formatDate(apt.date)}</p>
                        <p><strong>Time:</strong> ${Utils.formatTime(apt.time)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function displayPatientProfile() {
        const container = document.getElementById('patient-profile');
        const patientRecord = Storage.getPatientById(currentPatient.userId);

        if (!patientRecord) {
            container.innerHTML = '<p class="no-data">Patient data not found</p>';
            return;
        }

        const age = Utils.calculateAge(patientRecord.dob);

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4 style="color: var(--primary-color);">Personal Information</h4>
                    <p><strong>Name:</strong> ${patientRecord.name}</p>
                    <p><strong>Email:</strong> ${patientRecord.email}</p>
                    <p><strong>Phone:</strong> ${patientRecord.phone}</p>
                </div>
                <div>
                    <h4 style="color: var(--primary-color);">Medical Info</h4>
                    <p><strong>Gender:</strong> ${patientRecord.gender}</p>
                    <p><strong>Age:</strong> ${age} years</p>
                    <p><strong>DOB:</strong> ${Utils.formatDate(patientRecord.dob)}</p>
                </div>
            </div>
        `;
    }

    function setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (Utils.confirm('Logout?')) {
                    Auth.logout();
                }
            });
        }
    }
});

function cancelAppointment(appointmentId) {
    if (!Utils.confirm('Cancel this appointment?')) return;
    
    Storage.updateAppointment(appointmentId, { status: 'cancelled' });
    Utils.showToast('Appointment cancelled', 'success');
    
    setTimeout(() => {
        location.reload();
    }, 800);
}

