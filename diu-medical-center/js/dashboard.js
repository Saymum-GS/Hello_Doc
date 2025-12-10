/* ========================================
   DASHBOARD.JS - Admin Dashboard Logic
   Handles all dashboard functionality
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize dashboard
    initDashboard();
    loadStatistics();
    loadAppointments();
    setupEventListeners();
    displayCurrentDate();

    // Section navigation
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            const target = document.getElementById(`${targetSection}-section`);
            if (target) {
                target.style.display = 'block';
                document.getElementById('page-title').textContent = link.textContent.trim();
            }

            // Load section-specific data
            loadSectionData(targetSection);
        });
    });

    // Display current date
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

    // Initialize dashboard
    function initDashboard() {
        const user = Auth.getCurrentUser();
        Utils.showToast(`Welcome back, ${user.username}!`, 'success');
    }

    // Load statistics
    function loadStatistics() {
        const appointments = Storage.getAppointments();
        const patients = Storage.getPatients();
        const doctors = Storage.getDoctors();

        document.getElementById('total-appointments').textContent = appointments.length;

        const today = Utils.getTodayDate();
        const todayAppointments = appointments.filter(apt => apt.date === today);
        document.getElementById('today-appointments').textContent = todayAppointments.length;

        document.getElementById('total-patients').textContent = patients.length;
        document.getElementById('total-doctors').textContent = doctors.length;

        loadTodayAppointmentsList();
        loadCharts();
    }

    // Load today's appointments list
    function loadTodayAppointmentsList() {
        const today = Utils.getTodayDate();
        const appointments = Storage.getAppointments();
        const todayAppointments = appointments.filter(apt => apt.date === today && apt.status === 'scheduled');
        const container = document.getElementById('today-appointments-list');

        if (!container) return;

        if (todayAppointments.length === 0) {
            container.innerHTML = '<p class="no-data">No appointments scheduled for today</p>';
            return;
        }

        container.innerHTML = todayAppointments.map(apt => {
            const patient = Storage.getPatientById(apt.patientId);
            const doctor = Storage.getDoctorById(apt.doctorId);
            
            return `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <h4>${patient ? patient.name : 'Unknown'}</h4>
                        <span class="badge badge-success">${Utils.formatTime(apt.time)}</span>
                    </div>
                    <div class="appointment-details">
                        <p><strong>Doctor:</strong> ${doctor ? doctor.name : 'Unknown'}</p>
                        <p><strong>Specialty:</strong> ${doctor ? doctor.specialty : 'N/A'}</p>
                        <p><strong>Shift:</strong> ${doctor ? Utils.getShiftBadge(doctor.shift) : 'N/A'}</p>
                        <p><strong>Reason:</strong> ${apt.reason}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Load charts
    function loadCharts() {
        const appointments = Storage.getAppointments();
        const doctors = Storage.getDoctors();

        // Appointments by Doctor
        const doctorStats = {};
        doctors.forEach(doctor => {
            const count = appointments.filter(apt => apt.doctorId === doctor.id).length;
            doctorStats[doctor.name] = count;
        });

        createBarChart('doctorChart', 'Appointments by Doctor', doctorStats);

        // Appointments by Specialty
        const specialtyStats = {};
        doctors.forEach(doctor => {
            const count = appointments.filter(apt => apt.doctorId === doctor.id).length;
            specialtyStats[doctor.specialty] = (specialtyStats[doctor.specialty] || 0) + count;
        });

        createPieChart('specialtyChart', 'Appointments by Specialty', specialtyStats);

        createMonthlyTrendChart();
    }

    // Create bar chart
    function createBarChart(canvasId, title, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const labels = Object.keys(data);
        const values = Object.values(data);

        const maxValue = Math.max(...values, 1);
        const barWidth = Math.min(canvas.width / labels.length, 80);
        const chartHeight = canvas.height - 80;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        labels.forEach((label, index) => {
            const value = values[index];
            const barHeight = (value / maxValue) * chartHeight;

            const x = index * (canvas.width / labels.length) + 
                      (canvas.width / labels.length - barWidth) / 2;
            const y = canvas.height - barHeight - 50;

            // Bar
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Value
            ctx.fillStyle = '#374151';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 5);

            // Label
            ctx.save();
            ctx.translate(x + barWidth / 2, canvas.height - 30);
            ctx.rotate(-Math.PI / 6);
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(label.substring(0, 20), 0, 0);
            ctx.restore();
        });
    }

    // Create pie chart
    function createPieChart(canvasId, title, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const labels = Object.keys(data);
        const values = Object.values(data);
        const total = values.reduce((a, b) => a + b, 0);

        if (total === 0) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 60;

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let currentAngle = -Math.PI / 2;

        values.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 35);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 35);

            ctx.fillStyle = '#374151';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index].substring(0, 15), labelX, labelY);
            ctx.fillText(`${value} (${((value/total)*100).toFixed(1)}%)`, labelX, labelY + 15);

            currentAngle += sliceAngle;
        });
    }

    // Monthly Trends
    function createMonthlyTrendChart() {
        const canvas = document.getElementById('monthlyChart');
        if (!canvas) return;

        const appointments = Storage.getAppointments();
        const monthlyData = {};

        // Group by month
        appointments.forEach(apt => {
            const date = new Date(apt.date);
            const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
            monthlyData[key] = (monthlyData[key] || 0) + 1;
        });

        // Last 6 months
        const months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
            months.push({
                key,
                label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                count: monthlyData[key] || 0
            });
        }

        const ctx = canvas.getContext('2d');
        const maxValue = Math.max(...months.map(m => m.count), 1);
        const chartHeight = canvas.height - 60;
        const barWidth = canvas.width / months.length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        months.forEach((m, i) => {
            const barHeight = (m.count / maxValue) * chartHeight;
            const x = i * barWidth + 10;
            const y = canvas.height - barHeight - 40;

            ctx.fillStyle = '#10b981';
            ctx.fillRect(x, y, barWidth - 20, barHeight);

            ctx.fillStyle = '#374151';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(m.count, x + (barWidth - 20) / 2, y - 5);

            ctx.save();
            ctx.translate(x + (barWidth - 20) / 2, canvas.height - 20);
            ctx.rotate(-Math.PI / 4);
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(m.label, 0, 0);
            ctx.restore();
        });
    }

    // Load Appointments
    function loadAppointments() {
        const appointments = Storage.getAppointments();
        const tbody = document.getElementById('appointments-table-body');
        const noAppointments = document.getElementById('no-appointments');

        if (!tbody) return;

        if (appointments.length === 0) {
            tbody.innerHTML = '';
            if (noAppointments) noAppointments.style.display = 'block';
            return;
        }

        if (noAppointments) noAppointments.style.display = 'none';

        const sorted = [...appointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        tbody.innerHTML = sorted.map(apt => {
            const patient = Storage.getPatientById(apt.patientId);
            const doctor = Storage.getDoctorById(apt.doctorId);

            return `
                <tr>
                    <td>${apt.id}</td>
                    <td>${patient ? patient.name : 'N/A'}</td>
                    <td>${doctor ? doctor.name : 'N/A'}</td>
                    <td>${doctor ? doctor.specialty : 'N/A'}</td>
                    <td>${Utils.formatDate(apt.date)}</td>
                    <td>${Utils.formatTime(apt.time)}</td>
                    <td>${apt.reason}</td>
                    <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
                    <td>
                        <button class="btn btn-secondary btn-sm action-btn" onclick="editAppointment(${apt.id})">Edit</button>
                        <button class="btn btn-danger btn-sm action-btn" onclick="deleteAppointment(${apt.id})">Delete</button>
                        <button class="btn btn-success btn-sm action-btn" onclick="printAppointment(${apt.id})">Print</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Load Patients
    function loadPatients() {
        const patients = Storage.getPatients();
        const tbody = document.getElementById('patients-table-body');

        if (!tbody) return;

        if (patients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No patients registered</td></tr>';
            return;
        }

        tbody.innerHTML = patients.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.phone}</td>
                <td>${p.email}</td>
                <td>${p.gender}</td>
                <td>${Utils.formatDate(p.dob)} (${Utils.calculateAge(p.dob)} years)</td>
                <td>${Utils.formatDate(p.createdAt)}</td>
                <td>
                    <button class="btn btn-danger btn-sm action-btn" onclick="deletePatient(${p.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Load Analytics
    function loadAnalytics() {
        const appointments = Storage.getAppointments();
        const doctors = Storage.getDoctors();

        const upcoming = Storage.getUpcomingAppointments();
        const upcomingContainer = document.getElementById('upcoming-appointments');

        if (upcomingContainer) {
            if (upcoming.length === 0) {
                upcomingContainer.innerHTML = '<p class="no-data">No upcoming appointments in next 7 days</p>';
            } else {
                upcomingContainer.innerHTML = upcoming.map(apt => {
                    const patient = Storage.getPatientById(apt.patientId);
                    const doctor = Storage.getDoctorById(apt.doctorId);

                    return `
                        <div class="appointment-card">
                            <div class="appointment-header">
                                <h4>${patient ? patient.name : 'Unknown'}</h4>
                                <span class="badge badge-info">${Utils.formatDate(apt.date)}</span>
                            </div>
                            <div class="appointment-details">
                                <p><strong>Doctor:</strong> ${doctor ? doctor.name : 'Unknown'}</p>
                                <p><strong>Time:</strong> ${Utils.formatTime(apt.time)}</p>
                                <p><strong>Shift:</strong> ${doctor ? Utils.getShiftBadge(doctor.shift) : 'N/A'}</p>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Most booked doctors
        const doctorBookings = {};
        doctors.forEach(doc => {
            doctorBookings[doc.name] = appointments.filter(a => a.doctorId === doc.id).length;
        });

        const topDoctors = Object.entries(doctorBookings)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const topDoctorsContainer = document.getElementById('top-doctors');
        if (topDoctorsContainer) {
            if (topDoctors.length === 0) {
                topDoctorsContainer.innerHTML = '<p class="no-data">No booking data available</p>';
            } else {
                topDoctorsContainer.innerHTML = topDoctors.map(([name, count], index) => `
                    <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between;">
                            <strong>${index + 1}. ${name}</strong>
                            <span class="badge badge-primary">${count} bookings</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // Load Section Logic
    function loadSectionData(section) {
        switch (section) {
            case 'appointments':
                loadAppointments();
                populateFilters();
                break;
            case 'patients':
                loadPatients();
                break;
            case 'analytics':
                loadAnalytics();
                break;
        }
    }

    // Populate filters
    function populateFilters() {
        const doctors = Storage.getDoctors();
        const filterDoctor = document.getElementById('filter-doctor');
        const filterSpecialty = document.getElementById('filter-specialty');

        if (filterDoctor) {
            filterDoctor.innerHTML =
                `<option value="all">All Doctors</option>` +
                doctors.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        }

        if (filterSpecialty) {
            const specialties = [...new Set(doctors.map(d => d.specialty))];

            filterSpecialty.innerHTML =
                `<option value="all">All Specialties</option>` +
                specialties.map(s => `<option value="${s}">${s}</option>`).join('');
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        // Search
        const searchInput = document.getElementById('search-appointments');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(filterAppointments, 300));
        }

        ['filter-doctor','filter-specialty','filter-date','filter-status','sort-appointments']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('change', filterAppointments);
            });

        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) exportBtn.addEventListener('click', exportAppointments);

        // Modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        const editForm = document.getElementById('edit-form');
        if (editForm) {
            editForm.addEventListener('submit', handleEditSubmit);
        }
    }

    // Filtering Logic
    function filterAppointments() {
        const search = (document.getElementById('search-appointments')?.value || '').toLowerCase();
        const filterDoctor = document.getElementById('filter-doctor')?.value || 'all';
        const filterSpecialty = document.getElementById('filter-specialty')?.value || 'all';
        const filterDate = document.getElementById('filter-date')?.value || '';
        const filterStatus = document.getElementById('filter-status')?.value || 'all';
        const sort = document.getElementById('sort-appointments')?.value || 'newest';

        let appointments = Storage.getAppointments();
        const doctors = Storage.getDoctors();
        const patients = Storage.getPatients();

        // Search by patient name
        if (search) {
            appointments = appointments.filter(apt => {
                const p = patients.find(x => x.id === apt.patientId);
                return p?.name.toLowerCase().includes(search);
            });
        }

        // By Doctor
        if (filterDoctor !== 'all') {
            appointments = appointments.filter(apt => apt.doctorId === parseInt(filterDoctor));
        }

        // By Specialty
        if (filterSpecialty !== 'all') {
            appointments = appointments.filter(apt => {
                const doctor = doctors.find(d => d.id === apt.doctorId);
                return doctor?.specialty === filterSpecialty;
            });
        }

        // By Date
        if (filterDate) {
            appointments = appointments.filter(apt => apt.date === filterDate);
        }

        // By Status
        if (filterStatus !== 'all') {
            appointments = appointments.filter(apt => apt.status === filterStatus);
        }

        // Sorting
        if (sort === 'newest') {
            appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            appointments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        displayFilteredAppointments(appointments);
    }

    function displayFilteredAppointments(appointments) {
        const tbody = document.getElementById('appointments-table-body');
        const noAppointments = document.getElementById('no-appointments');

        if (!tbody) return;

        if (appointments.length === 0) {
            tbody.innerHTML = '';
            if (noAppointments) noAppointments.style.display = 'block';
            return;
        }

        if (noAppointments) noAppointments.style.display = 'none';

        tbody.innerHTML = appointments.map(apt => {
            const patient = Storage.getPatientById(apt.patientId);
            const doctor = Storage.getDoctorById(apt.doctorId);

            return `
                <tr>
                    <td>${apt.id}</td>
                    <td>${patient ? patient.name : 'N/A'}</td>
                    <td>${doctor ? doctor.name : 'N/A'}</td>
                    <td>${doctor ? doctor.specialty : 'N/A'}</td>
                    <td>${Utils.formatDate(apt.date)}</td>
                    <td>${Utils.formatTime(apt.time)}</td>
                    <td>${apt.reason}</td>
                    <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
                    <td>
                        <button class="btn btn-secondary btn-sm action-btn" onclick="editAppointment(${apt.id})">Edit</button>
                        <button class="btn btn-danger btn-sm action-btn" onclick="deleteAppointment(${apt.id})">Delete</button>
                        <button class="btn btn-success btn-sm action-btn" onclick="printAppointment(${apt.id})">Print</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Export
    function exportAppointments() {
        const appointments = Storage.getAppointments();
        const patients = Storage.getPatients();
        const doctors = Storage.getDoctors();

        const exportData = appointments.map(apt => {
            const patient = patients.find(p => p.id === apt.patientId);
            const doctor = doctors.find(d => d.id === apt.doctorId);

            return {
                appointmentId: apt.id,
                patientName: patient?.name || 'N/A',
                patientPhone: patient?.phone || 'N/A',
                doctorName: doctor?.name || 'N/A',
                specialty: doctor?.specialty || 'N/A',
                shift: doctor?.shift || 'N/A',
                date: apt.date,
                time: apt.time,
                reason: apt.reason,
                status: apt.status,
                createdAt: apt.createdAt
            };
        });

        Utils.exportToJSON(exportData, `diu_mc_appointments_${Date.now()}.json`);
        Utils.showToast('Appointments exported successfully', 'success');
    }

    // Modal Close
    function closeModal() {
        document.getElementById('edit-modal')?.classList.remove('active');
    }

    // Handle edit form submit
    function handleEditSubmit(e) {
        e.preventDefault();

        const id = parseInt(document.getElementById('edit-appointment-id').value);
        const date = document.getElementById('edit-date').value;
        const time = document.getElementById('edit-time').value;
        const reason = document.getElementById('edit-reason').value;
        const status = document.getElementById('edit-status').value;

        if (!Validation.validateFutureDate(date)) {
            Utils.showToast('Please select a future date', 'error');
            return;
        }

        const appointment = Storage.getAppointmentById(id);
        if (!appointment) {
            Utils.showToast('Appointment not found', 'error');
            return;
        }

        if (!Storage.isSlotAvailable(appointment.doctorId, date, time, id)) {
            Utils.showToast('This time slot is not available', 'error');
            return;
        }

        Storage.updateAppointment(id, { date, time, reason, status });
        Utils.showToast('Appointment updated successfully', 'success');

        closeModal();
        loadAppointments();
        loadStatistics();
    }

    // Global functions for onclick handlers
    window.editAppointment = id => {
        const apt = Storage.getAppointmentById(id);
        if (!apt) return;

        document.getElementById('edit-appointment-id').value = apt.id;
        document.getElementById('edit-date').value = apt.date;
        document.getElementById('edit-time').value = apt.time;
        document.getElementById('edit-reason').value = apt.reason;
        document.getElementById('edit-status').value = apt.status;

        document.getElementById('edit-modal').classList.add('active');
    };

    window.deleteAppointment = id => {
        if (!Utils.confirm('Are you sure you want to delete this appointment?')) return;

        Storage.deleteAppointment(id);
        Utils.showToast('Appointment deleted successfully', 'success');

        loadAppointments();
        loadStatistics();
    };

    window.deletePatient = id => {
        if (!Utils.confirm('Are you sure you want to delete this patient? This will also delete all their appointments.')) return;

        Storage.getPatientAppointments(id).forEach(a => Storage.deleteAppointment(a.id));
        Storage.deletePatient(id);

        Utils.showToast('Patient deleted successfully', 'success');

        loadPatients();
        loadAppointments();
        loadStatistics();
    };

    window.printAppointment = id => {
        const apt = Storage.getAppointmentById(id);
        if (!apt) return;

        const patient = Storage.getPatientById(apt.patientId);
        const doctor = Storage.getDoctorById(apt.doctorId);

        const html = `
            <div style="padding: 40px; font-family: Arial, sans-serif;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #3b82f6;">🏥 DIU Medical Center</h1>
                    <p>Daffodil International University</p>
                    <p>Ashulia, Dhaka, Bangladesh</p>
                </div>

                <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Appointment Slip</h2>

                <div style="margin: 20px 0;">
                    <p><strong>Appointment ID:</strong> ${apt.id}</p>
                    <p><strong>Patient Name:</strong> ${patient?.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${patient?.phone || 'N/A'}</p>
                    <p><strong>Doctor:</strong> ${doctor?.name || 'N/A'}</p>
                    <p><strong>Specialty:</strong> ${doctor?.specialty || 'N/A'}</p>
                    <p><strong>Shift:</strong> ${
                        doctor?.shift === 'day'
                            ? 'Day Shift (9 AM - 4 PM)'
                            : 'Evening Shift (4 PM - 12 AM)'
                    }</p>
                    <p><strong>Date:</strong> ${Utils.formatDate(apt.date)}</p>
                    <p><strong>Time:</strong> ${Utils.formatTime(apt.time)}</p>
                    <p><strong>Reason:</strong> ${apt.reason}</p>
                    <p><strong>Status:</strong> ${apt.status.toUpperCase()}</p>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc;">
                    <p style="font-size: 12px; color: #666;">
                        <strong>Contact Information:</strong><br>
                        Email: diumc@daffodilvarsity.edu.bd<br>
                        Medical Center Hotline: 01847140120<br>
                        Ambulance Hotline: 01847334999
                    </p>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                        Please arrive 10 minutes before your appointment time.
                    </p>
                </div>
            </div>
        `;

        const win = window.open('', '', 'width=800,height=600');
        win.document.write(`<html><head><title>DIU Medical Center - Appointment Slip</title></head><body>${html}</body></html>`);
        win.document.close();
        win.print();
    };
});
