/* ========================================
   UTILS.JS - Utility Functions
   Common helper functions
   ======================================== */

const Utils = {
    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        }[type] || 'ℹ';

        toast.innerHTML = `
            <span style="font-size: 1.2rem; font-weight: bold;">${icon}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Format date to readable format
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    // Format date to YYYY-MM-DD
    formatDateInput(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Get today's date in YYYY-MM-DD format
    getTodayDate() {
        return this.formatDateInput(new Date());
    },

    // Format time to 12-hour format
    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    },

    // Generate time slots
    generateTimeSlots(startTime, endTime, interval = 30) {
        const slots = [];
        let start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);

        // Handle overnight shifts
        if (end <= start) {
            // Generate slots until midnight
            while (start < 24 * 60) {
                slots.push(this.minutesToTime(start));
                start += interval;
            }
            // Generate slots from midnight to end time
            start = 0;
            while (start < end) {
                slots.push(this.minutesToTime(start));
                start += interval;
            }
        } else {
            while (start < end) {
                slots.push(this.minutesToTime(start));
                start += interval;
            }
        }

        return slots;
    },

    // Convert time string to minutes
    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    },

    // Convert minutes to time string
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Export data to JSON file
    exportToJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },

    // Print element
    printElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>DIU Medical Center - Print</title>');
        printWindow.document.write(`
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #3b82f6; }
                .slip-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .slip-label { font-weight: bold; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    },

    // Get URL parameter
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // Calculate age from date of birth
    calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },

    // Check if date is today
    isToday(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },

    // Get day name from date
    getDayName(dateString) {
        const date = new Date(dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    },

    // Format shift time
    formatShiftTime(shift) {
        if (shift === 'day') {
            return '9:00 AM - 4:00 PM';
        } else if (shift === 'evening') {
            return '4:00 PM - 12:00 AM';
        }
        return 'N/A';
    },

    // Get shift badge HTML
    getShiftBadge(shift) {
        const icon = shift === 'day' ? '☀️' : '🌙';
        return `<span class="shift-badge ${shift}">${icon} ${shift.toUpperCase()}</span>`;
    }
};