🏥 DIU Medical Center - Appointment Management System

A complete, production-ready frontend application for managing doctor appointments at Daffodil International University Medical Center using HTML, CSS, and vanilla JavaScript with LocalStorage for data persistence.

📋 Table of Contents

Features

Project Structure

Installation

Usage

Official Information

User Roles

Technologies Used

Browser Support

✨ Features
Patient Features

Patient registration with validation

Browse doctors by specialty and shift

View detailed doctor profiles

Book appointments with available doctors

Check appointment status using phone number

View upcoming and past appointments

Prevent double booking

Real-time slot availability

Admin Features

Secure login system

Dashboard with statistics

Manage all appointments

Edit/delete appointments

Change appointment status

Search and filter

Filter by doctor, specialty, date & status

Sort appointments

Dashboard analytics with charts

Export appointments to JSON

Print appointment slips

View today’s appointments

Upcoming appointment reminders

Monthly trend analysis

Patient management

Technical Features

LocalStorage data persistence

Seed data for demo

Dark mode

Responsive design

Toast notifications

Modular architecture

Breadcrumb navigation

No external dependencies

📁 Project Structure
diu-medical-center/
├── assets/
│   ├── images/
│   └── icons/
├── components/
│   ├── navbar.html
│   └── footer.html
├── css/
│   ├── main.css
│   ├── home.css
│   ├── doctors.css
│   ├── doctor-profile.css
│   ├── register.css
│   ├── appointment.css
│   ├── dashboard.css
│   ├── lookup.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── auth.js
│   ├── validation.js
│   ├── doctors.js
│   ├── patients.js
│   ├── appointments.js
│   ├── dashboard.js
│   ├── lookup.js
│   ├── utils.js
│   └── components.js
├── data/
│   ├── doctors.json
│   └── seed.json
├── pages/
│   ├── doctors.html
│   ├── doctor-profile.html
│   ├── register.html
│   ├── book.html
│   ├── login.html
│   ├── dashboard.html
│   └── lookup.html
├── index.html
└── README.md

🚀 Installation

Download the project

No installation required (pure frontend)

Open index.html in any browser
OR use a local development server (recommended)

Using Local Server (Recommended)
1. VS Code Live Server

Install VS Code

Install Live Server extension

Right-click index.html → Open with Live Server

2. Python Server
python -m http.server 8000


Open: http://localhost:8000

💻 Usage
Patient Workflow
1. Register

Fill out the form → Submit

2. Browse Doctors

Filter by specialty / shift → View doctor profiles

3. Book Appointment

Select patient → Choose doctor → Pick date & time → Submit

4. Check Appointments

Enter phone number → View appointments

Admin Workflow
Login

Username: admin
Password: admin123

Dashboard

View statistics

Manage appointments

Edit / delete

Filter & search

Analytics & charts

Export data

📞 Official Information

DIU Medical Center Contacts

Email: diumc@daffodilvarsity.edu.bd

Hotline: 01847140120

Ambulance: 01847334999

Location: DIU, Ashulia, Dhaka

Official Medical Staff

Day Shift (9:00 AM - 4:00 PM)

Dr. Aysha Akhter — Medical Officer

Sushanta Kumar Ghose — Physiotherapist

Evening Shift (4:00 PM - 12:00 AM)
3. Dr. Md. Fazlay Rabbi Rakib — Medical Officer
4. Ruhul Amin Razu — Medical Assistant
5. Toufika Jahan — Medical Assistant

Demo Seed Patients

Md Golam Sharoar Saymum

Suriya Sharmin Mim

Samia Islam

Rifah Tasfiya

Muhsana Rajjak Rima

👥 User Roles
Patient

Register

View doctors

Book appointments

View appointments

No login required

Admin

Full control

Dashboard + analytics

Login required

🛠️ Technologies Used
Frontend

HTML5

CSS3 (variables, grid, flexbox, animations)

JavaScript ES6+

APIs & Features

LocalStorage API

Fetch API

Canvas API (charts)

Modular JavaScript

🌐 Browser Support

Supported:

Chrome

Firefox

Safari

Edge

Opera

(LocalStorage must be enabled.)

📱 Responsive Design

Optimized for:

Mobile

Tablet

Desktop

Large screens

🔒 Data Storage

Stored in LocalStorage:

Doctors

Patients

Appointments

Data persists unless the user clears browser storage.

🌙 Dark Mode

Built-in dark theme toggle

Saves preference in LocalStorage

Works on all pages

🔐 Admin Credentials
Username: admin
Password: admin123

📊 Feature Details
Form Validation

Email format

Phone number

Required fields

Future dates only

Shift-based time matching

Appointment Logic

Prevent double bookings

Doctor availability check

Past date restriction

Status: scheduled / completed / cancelled

Dashboard Analytics

Total appointments

Today’s appointments

Patient stats

Doctor stats

Bar, pie, and line charts

Monthly trends

Most booked doctors

🎨 UI/UX Features

Modern layout

Smooth animations

Toast notifications

Modal dialogs

Breadcrumbs

Mobile-friendly navbar

Dark mode

🐛 Troubleshooting
Problem	Solution
Navbar/footer not loading	Use Live Server or Python server
Data not saving	Enable LocalStorage
Admin login fails	Use correct credentials
Seed data missing	Clear LocalStorage and refresh
🔮 Future Enhancements

Email notifications

Availability calendar

Medical history

Payment integration

SMS reminders

Multi-language support

Doctor dashboard

Prescription management

📄 License

Created for educational purposes for Daffodil International University.

👨‍💻 Development Team

A complete frontend demonstration project for DIU Medical Center.

📧 Support

Email: diumc@daffodilvarsity.edu.bd

Hotline: 01847140120