# ClinicFlow

ClinicFlow is a full-stack clinic front-desk appointment management system.

It helps clinic staff manage doctors, patients, and appointments while preventing doctor double-booking.

## Features Implemented

* User registration and login
* JWT authentication
* Password hashing using bcrypt
* Doctor listing
* Doctor details
* Doctor schedule by date
* Patient creation
* Patient listing
* Patient search
* Patient details
* Patient appointment history
* Appointment booking
* Doctor double-booking prevention
* Appointment listing
* Appointment details
* Appointment cancellation
* Automatic cancellation fee calculation
* Appointment rescheduling through API
* Rescheduling overlap check
* Appointment search
* Pagination
* Sorting
* Dashboard with clinic statistics
* Automatic appointment reminders through clock API
* Automatic `NO_SHOW` marking after 30 minutes
* Notification outbox API

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript / JSX
* React Router
* Tailwind CSS
* Lucide React
* Fetch API

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcryptjs
* better-sqlite3
* CORS
* dotenv
* Nodemon

### Database

* SQLite

---

## Project Structure

```text
clinicflow/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── doctor.controller.js
│   │   ├── patient.controller.js
│   │   ├── appointment.controller.js
│   │   └── automation.controller.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── patient.routes.js
│   │   ├── appointment.routes.js
│   │   └── automation.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── database/
│   │   ├── db.js
│   │   ├── schema.sql
│   │   └── seed.js
│   │
│   ├── utils/
│   │   ├── cancellation.js
│   │   └── validation.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── database/
│   └── clinicflow.db
│
├── README.md
├── REASONING.md
├── AI_LOGS.md
├── .gitignore
└── package.json
```

---

# Database

ClinicFlow uses a relational SQLite database.

### Tables

#### users

Stores registered users.

* id
* name
* email
* password_hash
* created_at

#### doctors

Stores doctor information.

* id
* name
* specialization
* created_at

#### patients

Stores patient information.

* id
* patient_code
* name
* phone
* email
* created_at

#### appointments

Stores appointment information.

* id
* doctor_id
* patient_id
* appointment_date
* start_time
* end_time
* status
* cancellation_fee
* cancelled_at
* created_at

Appointment statuses:

```text
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
```

#### notifications

Stores generated appointment notifications.

* id
* appointment_id
* patient_id
* type
* message
* created_at

Foreign keys and indexes are used for the relationships and commonly accessed data.

---

# Authentication

Users can register and log in.

Passwords are hashed using bcrypt before being stored.

After login, the server provides a JWT token.

Protected APIs use:

```text
Authorization: Bearer <token>
```

---

# Appointment Booking

When booking an appointment, the backend checks whether the selected doctor already has an overlapping appointment.

The overlap condition used is:

```text
new_start < existing_end
AND
new_end > existing_start
```

For example:

```text
10:00 - 10:30
10:30 - 11:00
```

are allowed.

But:

```text
10:00 - 10:30
10:15 - 10:45
```

are rejected.

This validation is performed on the backend.

---

# Cancellation

The implemented cancellation policy is:

* Cancellation **2 hours or more before** the appointment → ₹0 fee
* Cancellation **less than 2 hours before** the appointment → ₹500 fee

The cancellation fee is calculated by the backend.

---

# Rescheduling

The backend supports rescheduling an appointment.

```http
PATCH /api/appointments/:id/reschedule
```

Before rescheduling, the system checks the new time for doctor availability and prevents overlapping appointments.

---

# Search, Pagination and Sorting

Patient search:

```http
GET /api/patients/search?q=Rahul
```

Appointments support listing with pagination and sorting.

Example:

```http
GET /api/appointments?page=1&limit=10
```

The API returns pagination information including:

* page
* limit
* total
* totalPages

---

# Automatic Clock

The system includes:

```http
POST /api/clock
```

This endpoint runs the implemented appointment automation.

It:

1. Creates reminders for today's confirmed appointments.
2. Marks a confirmed appointment as `NO_SHOW` when it is more than 30 minutes past its start time.

Generated notifications can be viewed using:

```http
GET /api/outbox
```

---

# API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

## Doctors

```http
GET /api/doctors
GET /api/doctors/:id
GET /api/doctors/:id/schedule?date=YYYY-MM-DD
```

## Patients

```http
POST /api/patients
GET /api/patients
GET /api/patients/search?q=...
GET /api/patients/:id
GET /api/patients/:id/appointments
```

## Appointments

```http
POST /api/appointments
GET /api/appointments
GET /api/appointments/:id
PATCH /api/appointments/:id/cancel
PATCH /api/appointments/:id/reschedule
```

## Automation

```http
POST /api/clock
GET /api/outbox
```

---

# Running the Project

## 1. Clone the repository

```bash
git clone https://github.com/imranalamb230442/clinicflow.git
cd clinicflow
```

## 2. Install dependencies

### Root

```bash
npm install
```

### Server

```bash
cd server
npm install
```

### Client

```bash
cd ../client
npm install
```

## 3. Configure environment

Create:

```text
server/.env
```

with:

```env
PORT=5000
JWT_SECRET=your-secret-key
```

## 4. Seed the database

```bash
cd server
npm run seed
```

## 5. Start backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

## 6. Start frontend

Open another terminal:

```bash
cd client
npm run dev
```

Open the URL shown by Vite.

---

# Testing Done

During development, the following were tested:

* Registration
* Login
* JWT authentication
* Doctor API
* Doctor schedule API
* Patient API
* Patient search
* Patient appointment history
* Appointment listing
* Pagination
* Sorting
* Cancellation
* Cancellation fee calculation
* Rescheduling logic
* Clock automation
* Reminder creation logic
* NO_SHOW logic

---


