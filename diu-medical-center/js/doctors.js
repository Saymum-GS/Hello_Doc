/* ========================================
   DOCTORS.JS - Doctors Page Logic
   Handles doctors list display and filtering
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const doctorsGrid = document.getElementById('doctors-grid');
    const noDoctors = document.getElementById('no-doctors');
    const specialtyFilter = document.getElementById('specialty-filter');
    const shiftFilter = document.getElementById('shift-filter');
    const searchInput = document.getElementById('search-doctor');

    if (!doctorsGrid) return;

    let allDoctors = Storage.getDoctors();

    // Display all doctors initially
    displayDoctors(allDoctors);

    // Filter by specialty
    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', () => {
            filterDoctors();
        });
    }

    // Filter by shift
    if (shiftFilter) {
        shiftFilter.addEventListener('change', () => {
            filterDoctors();
        });
    }

    // Search doctors
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(() => {
            filterDoctors();
        }, 300));
    }

    // Filter doctors based on search, specialty, and shift
    function filterDoctors() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedSpecialty = specialtyFilter ? specialtyFilter.value : 'all';
        const selectedShift = shiftFilter ? shiftFilter.value : 'all';

        let filtered = allDoctors;

        // Filter by specialty
        if (selectedSpecialty !== 'all') {
            filtered = filtered.filter(doctor => 
                doctor.specialty === selectedSpecialty
            );
        }

        // Filter by shift
        if (selectedShift !== 'all') {
            filtered = filtered.filter(doctor => 
                doctor.shift === selectedShift
            );
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(doctor =>
                doctor.name.toLowerCase().includes(searchTerm) ||
                doctor.specialty.toLowerCase().includes(searchTerm) ||
                doctor.qualification.toLowerCase().includes(searchTerm)
            );
        }

        displayDoctors(filtered);
    }

    // Display doctors in grid
    function displayDoctors(doctors) {
        if (doctors.length === 0) {
            doctorsGrid.style.display = 'none';
            if (noDoctors) noDoctors.style.display = 'block';
            return;
        }

        doctorsGrid.style.display = 'grid';
        if (noDoctors) noDoctors.style.display = 'none';

        doctorsGrid.innerHTML = doctors.map(doctor => `
            <div class="doctor-card">
                <div class="doctor-image">
                    <img src="${doctor.image}" alt="${doctor.name}">
                </div>
                <div class="doctor-info">
                    <div class="doctor-header">
                        <div>
                            <h3 class="doctor-name">${doctor.name}</h3>
                            <span class="doctor-specialty">${doctor.specialty}</span>
                        </div>
                        ${Utils.getShiftBadge(doctor.shift)}
                    </div>
                    <p class="doctor-qualification">${doctor.qualification}</p>
                    <p class="doctor-experience">${doctor.experience} years of experience</p>
                    <div class="doctor-timings">
                        <strong>Available:</strong> ${Utils.formatShiftTime(doctor.shift)}<br>
                        <strong>Shift:</strong> ${doctor.shift === 'day' ? 'Day Shift' : 'Evening Shift (4 PM - 12 AM)'}
                    </div>
                    ${doctor.email ? `<p class="doctor-email">📧 ${doctor.email}</p>` : ''}
                    <div class="doctor-actions">
                        <a href="doctor-profile.html?id=${doctor.id}" class="btn btn-secondary">View Profile</a>
                        <a href="book.html?doctor=${doctor.id}" class="btn btn-primary">Book Now</a>
                    </div>
                </div>
            </div>
        `).join('');
    }
});