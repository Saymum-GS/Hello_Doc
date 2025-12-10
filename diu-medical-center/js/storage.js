/* ========================================
   STORAGE.JS - LocalStorage Management
   Handles all data storage operations
   ======================================== */

const Storage = {
    // Keys for localStorage
    KEYS: {
        DOCTORS: 'diu_mc_doctors',
        PATIENTS: 'diu_mc_patients',
        APPOINTMENTS: 'diu_mc_appointments',
        INITIALIZED: 'diu_mc_initialized'
    },

    // Initialize storage with seed data
    async init() {
        const isInitialized = localStorage.getItem(this.KEYS.INITIALIZED);
        
        if (!isInitialized) {
            // Load seed data
            await this.loadSeedData();
            localStorage.setItem(this.KEYS.INITIALIZED, 'true');
        } else {
            // Ensure doctors are loaded
            if (!localStorage.getItem(this.KEYS.DOCTORS)) {
                await this.loadDoctors();
            }
        }
    },

    // Load seed data from seed.json
    async loadSeedData() {
        try {
            const response = await fetch('/data/seed.json');
            const data = await response.json();
            
            // Load doctors first
            await this.loadDoctors();
            
            // Load seed patients and appointments
            this.setPatients(data.patients);
            this.setAppointments(data.appointments);
            
            console.log('Seed data loaded successfully');
        } catch (error) {
            console.error('Error loading seed data:', error);
            // Initialize with empty data if seed fails
            await this.loadDoctors();
            this.setPatients([]);
            this.setAppointments([]);
        }
    },

    // Load doctors from doctors.json
    async loadDoctors() {
        try {
            const response = await fetch('/data/doctors.json');
            const data = await response.json();
            this.setDoctors(data.doctors);
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.setDoctors([]);
        }
    },

    // Doctors Methods
    getDoctors() {
        const data = localStorage.getItem(this.KEYS.DOCTORS);
        return data ? JSON.parse(data) : [];
    },

    setDoctors(doctors) {
        localStorage.setItem(this.KEYS.DOCTORS, JSON.stringify(doctors));
    },

    getDoctorById(id) {
        const doctors = this.getDoctors();
        return doctors.find(d => d.id === parseInt(id));
    },

    // Patients Methods
    getPatients() {
        const data = localStorage.getItem(this.KEYS.PATIENTS);
        return data ? JSON.parse(data) : [];
    },

    setPatients(patients) {
        localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(patients));
    },

    addPatient(patient) {
        const patients = this.getPatients();
        const newPatient = {
            id: Date.now(),
            ...patient,
            createdAt: new Date().toISOString()
        };
        patients.push(newPatient);
        this.setPatients(patients);
        return newPatient;
    },

    getPatientById(id) {
        const patients = this.getPatients();
        return patients.find(p => p.id === parseInt(id));
    },

    getPatientByPhone(phone) {
        const patients = this.getPatients();
        return patients.find(p => p.phone === phone);
    },

    updatePatient(id, updatedData) {
        const patients = this.getPatients();
        const index = patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            patients[index] = { ...patients[index], ...updatedData };
            this.setPatients(patients);
            return patients[index];
        }
        return null;
    },

    deletePatient(id) {
        const patients = this.getPatients();
        const filtered = patients.filter(p => p.id !== parseInt(id));
        this.setPatients(filtered);
    },

    // Appointments Methods
    getAppointments() {
        const data = localStorage.getItem(this.KEYS.APPOINTMENTS);
        return data ? JSON.parse(data) : [];
    },

    setAppointments(appointments) {
        localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(appointments));
    },

    addAppointment(appointment) {
        const appointments = this.getAppointments();
        const newAppointment = {
            id: Date.now(),
            ...appointment,
            status: appointment.status || 'scheduled',
            createdAt: new Date().toISOString()
        };
        appointments.push(newAppointment);
        this.setAppointments(appointments);
        return newAppointment;
    },

    getAppointmentById(id) {
        const appointments = this.getAppointments();
        return appointments.find(a => a.id === parseInt(id));
    },

    updateAppointment(id, updatedData) {
        const appointments = this.getAppointments();
        const index = appointments.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...updatedData };
            this.setAppointments(appointments);
            return appointments[index];
        }
        return null;
    },

    deleteAppointment(id) {
        const appointments = this.getAppointments();
        const filtered = appointments.filter(a => a.id !== parseInt(id));
        this.setAppointments(filtered);
    },

    // Check if appointment slot is available
    isSlotAvailable(doctorId, date, time, excludeAppointmentId = null) {
        const appointments = this.getAppointments();
        return !appointments.some(apt => 
            apt.doctorId === parseInt(doctorId) &&
            apt.date === date &&
            apt.time === time &&
            apt.id !== excludeAppointmentId &&
            apt.status !== 'cancelled'
        );
    },

    // Get appointments for a specific patient
    getPatientAppointments(patientId) {
        const appointments = this.getAppointments();
        return appointments.filter(apt => apt.patientId === parseInt(patientId));
    },

    // Get appointments for a specific doctor
    getDoctorAppointments(doctorId) {
        const appointments = this.getAppointments();
        return appointments.filter(apt => apt.doctorId === parseInt(doctorId));
    },

    // Get today's appointments
    getTodayAppointments() {
        const today = new Date().toISOString().split('T')[0];
        const appointments = this.getAppointments();
        return appointments.filter(apt => apt.date === today);
    },

    // Get upcoming appointments (next 7 days)
    getUpcomingAppointments() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const appointments = this.getAppointments();
        
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= today && aptDate <= nextWeek && apt.status === 'scheduled';
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    // Clear all data (useful for testing)
    clearAll() {
        localStorage.removeItem(this.KEYS.DOCTORS);
        localStorage.removeItem(this.KEYS.PATIENTS);
        localStorage.removeItem(this.KEYS.APPOINTMENTS);
        localStorage.removeItem(this.KEYS.INITIALIZED);
    },

    // Reset to seed data
    async resetToSeedData() {
        this.clearAll();
        await this.init();
    }
};

// Initialize storage when script loads
Storage.init();