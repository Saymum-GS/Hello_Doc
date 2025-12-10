/* ========================================
   DASHBOARD-DOCTOR.JS - Doctor Dashboard (FIXED v2)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Protect page
    if (!Auth.protectPage('doctor')) {
        return;
    }

    const currentUser = Auth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'doctor') {
        window.location.href = 'login.html';
        return;
    }

    const currentDoctor = currentUser;
    
    // Initialize
    initDashboard();
    displayCurrentDate();
    setupNavigation();
    loadDoctorData();
    setupLogout();

    function initDashboard() {
        const welcomeDiv = document.getElementById('doctor-welcome');
        if (welcomeDiv) {
            const shift = currentDoctor.shift === 'day' ? 'Day (9 AM - 4 PM)' : 'Evening (4 PM - 12 AM)';
            welcomeDiv.innerHTML = `
                <p>Welcome, <strong>Dr. ${currentDoctor.userName}</strong></p>
                <p style="color: var(--text-light); font-size: 0.9rem;">
                    ${currentDoctor.specialty} | ${shift}
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
                    displayDoctorProfile();
                }
            });
        });
    }

    function loadDoctorData() {
        const appointments = Storage.getAppointments()
            .filter(apt => apt.doctorId === currentDoctor.userId);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayApts = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate.getTime() === today.getTime() && apt.status !== 'cancelled';
        }).sort((a, b) => {
            const timeA = a.time.split(':').join('');
            const timeB = b.time.split(':').join('');
            return timeA - timeB;
        });

        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const thisWeek = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate >= today && aptDate <= weekEnd && apt.status !== 'cancelled';
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        const completedToday = todayApts.filter(apt => apt.status === 'completed').length;

        document.getElementById('today-count').textContent = todayApts.length;
        document.getElementById('upcoming-count').textContent = thisWeek.length;
        document.getElementById('completed-count').textContent = completedToday;

        displayTodayAppointments(todayApts);
        displayAllAppointments(appointments);
        displayUpcomingWeek(thisWeek);
    }

    function displayTodayAppointments(appointments) {
        const container = document.getElementById('today-appointments');

        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-data">No appointments today</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => {
            const patient = Storage.getPatientById(apt.patientId);
            return `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <h4>${patient ? patient.name : 'Unknown'}</h4>
                        <span class="status-badge status-${apt.status}">${apt.status.toUpperCase()}</span>
                    </div>
                    <div class="appointment-details">
                        <p><strong>Time:</strong> ${Utils.formatTime(apt.time)}</p>
                        <p><strong>Phone:</strong> ${patient ? patient.phone : 'N/A'}</p>
                        <p><strong>Reason:</strong> ${apt.reason}</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="openStatusModal(${apt.id})">Update Status</button>
                </div>
            `;
        }).join('');
    }

    function displayAllAppointments(appointments) {
        const container = document.getElementById('doctor-appointments');

        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-data">No appointments</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => {
            const patient = Storage.getPatientById(apt.patientId);
            return `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <h4>${patient ? patient.name : 'Unknown'}</h4>
                        <span class="status-badge status-${apt.status}">${apt.status.toUpperCase()}</span>
                    </div>
                    <div class="appointment-details">
                        <p><strong>Date:</strong> ${Utils.formatDate(apt.date)}</p>
                        <p><strong>Time:</strong> ${Utils.formatTime(apt.time)}</p>
                        <p><strong>Reason:</strong> ${apt.reason}</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="openStatusModal(${apt.id})">Update Status</button>
                </div>
            `;
        }).join('');
    }

    function displayUpcomingWeek(appointments) {
        const container = document.getElementById('upcoming-week');

        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-data">No upcoming appointments</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => {
            const patient = Storage.getPatientById(apt.patientId);
            return `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <h4>${patient ? patient.name : 'Unknown'}</h4>
                        <span class="status-badge status-${apt.status}">${apt.status.toUpperCase()}</span>
                    </div>
                    <div class="appointment-details">
                        <p><strong>Date:</strong> ${Utils.formatDate(apt.date)}</p>
                        <p><strong>Time:</strong> ${Utils.formatTime(apt.time)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function displayDoctorProfile() {
        const container = document.getElementById('doctor-profile');
        const doctorRecord = Storage.getDoctorById(currentDoctor.userId);

        if (!doctorRecord) {
            container.innerHTML = '<p class="no-data">Doctor data not found</p>';
            return;
        }

        const shift = doctorRecord.shift === 'day' ? 'Day (9 AM - 4 PM)' : 'Evening (4 PM - 12 AM)';

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4 style="color: var(--primary-color);">Professional Info</h4>
                    <p><strong>Name:</strong> Dr. ${doctorRecord.name}</p>
                    <p><strong>Specialty:</strong> ${doctorRecord.specialty}</p>
                    <p><strong>Experience:</strong> ${doctorRecord.experience} years</p>
                    <p><strong>Qualification:</strong> ${doctorRecord.qualification}</p>
                </div>
                <div>
                    <h4 style="color: var(--primary-color);">Schedule</h4>
                    <p><strong>Shift:</strong> ${shift}</p>
                    <p><strong>Working Days:</strong> Sunday - Thursday</p>
                    <p><strong>Email:</strong> ${doctorRecord.email || 'N/A'}</p>
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

function openStatusModal(appointmentId) {
    const appointment = Storage.getAppointmentById(appointmentId);
    if (!appointment) return;

    const patient = Storage.getPatientById(appointment.patientId);
    const infoDiv = document.getElementById('modal-appointment-info');

    infoDiv.innerHTML = `
        <p><strong>Patient:</strong> ${patient ? patient.name : 'Unknown'}</p>
        <p><strong>Date:</strong> ${Utils.formatDate(appointment.date)}</p>
        <p><strong>Time:</strong> ${Utils.formatTime(appointment.time)}</p>
        <p><strong>Current Status:</strong> ${appointment.status}</p>
        <p><strong>Reason:</strong> ${appointment.reason}</p>
    `;

    window.updateAppointmentId = appointmentId;
    document.getElementById('status-modal').classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('status-modal');
    if (!modal) return;

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    const confirmBtn = document.getElementById('confirm-status-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const appointmentId = window.updateAppointmentId;
            const newStatus = document.getElementById('new-status').value;

            if (!appointmentId) return;

            Storage.updateAppointment(appointmentId, { status: newStatus });
            Utils.showToast('Status updated', 'success');
            modal.classList.remove('active');

            setTimeout(() => {
                location.reload();
            }, 800);
        });
    }
});

