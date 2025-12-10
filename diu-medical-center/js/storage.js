/* ========================================
   STORAGE.JS - LocalStorage Management (FIXED v2)
   ======================================== */

const Storage = {
    KEYS: {
        DOCTORS: 'diu_mc_doctors',
        PATIENTS: 'diu_mc_patients',
        APPOINTMENTS: 'diu_mc_appointments',
        INITIALIZED: 'diu_mc_initialized'
    },

    async init() {
        try {
            const isInitialized = localStorage.getItem(this.KEYS.INITIALIZED);
            
            if (!isInitialized) {
                await this.loadSeedData();
                localStorage.setItem(this.KEYS.INITIALIZED, 'true');
            } else {
                if (!localStorage.getItem(this.KEYS.DOCTORS)) {
                    await this.loadDoctors();
                }
            }
        } catch (error) {
            console.error('Storage init error:', error);
            await this.loadDoctors();
        }
    },

    async loadSeedData() {
        try {
            const response = await fetch('/data/seed.json');
            const data = await response.json();
            
            await this.loadDoctors();
            this.setPatients(data.patients);
            this.setAppointments(data.appointments);
            
        } catch (error) {
            console.error('Seed load error:', error);
            await this.loadDoctors();
            this.setPatients([]);
            this.setAppointments([]);
        }
    },

    async loadDoctors() {
        try {
            const response = await fetch('/data/doctors.json');
            const data = await response.json();
            this.setDoctors(data.doctors);
        } catch (error) {
            console.error('Doctors load error:', error);
            this.setDoctors([]);
        }
    },

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

    isSlotAvailable(doctorId, date, time, excludeAppointmentId = null) {
        const appointments = this.getAppointments();
        const conflict = appointments.find(apt => 
            apt.doctorId === parseInt(doctorId) &&
            apt.date === date &&
            apt.time === time &&
            apt.id !== excludeAppointmentId &&
            ['scheduled', 'completed'].includes(apt.status)
        );
        return !conflict;
    },

    getPatientAppointments(patientId) {
        const appointments = this.getAppointments();
        return appointments.filter(apt => apt.patientId === parseInt(patientId));
    },

    getDoctorAppointments(doctorId) {
        const appointments = this.getAppointments();
        return appointments.filter(apt => apt.doctorId === parseInt(doctorId));
    },

    getTodayAppointments() {
        const today = new Date().toISOString().split('T')[0];
        const appointments = this.getAppointments();
        return appointments.filter(apt => apt.date === today);
    },

    getUpcomingAppointments() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const appointments = this.getAppointments();
        
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate >= today && aptDate <= nextWeek && apt.status === 'scheduled';
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    clearAll() {
        localStorage.removeItem(this.KEYS.DOCTORS);
        localStorage.removeItem(this.KEYS.PATIENTS);
        localStorage.removeItem(this.KEYS.APPOINTMENTS);
        localStorage.removeItem(this.KEYS.INITIALIZED);
    },

    async resetToSeedData() {
        this.clearAll();
        await this.init();
    }
};

Storage.init();

