# ClinicFlow – My Development Reasoning

## 1. What I understood from the problem

I understood that the main purpose of the project is to help the clinic front desk manage doctors, patients and appointments from one place.

The most important problem I wanted to solve was doctor double-booking. If a doctor already has an appointment at a particular time, the system should not allow another overlapping appointment.

Along with this, I also needed to implement login, patient search, appointment cancellation, rescheduling, pagination, sorting and the automatic reminder/no-show functionality.

I mainly designed the system for a clinic receptionist or front-desk staff member because they are the people who will use the system regularly.

---

## 2. Why I selected this technology

I used React with Vite for the frontend because I was comfortable working with React and it allowed me to quickly build the required UI.

For the backend, I used Node.js and Express because it is simple to create REST APIs with it.

For the database, I used SQLite with better-sqlite3. I selected SQLite because the project needed a proper relational database but I also needed something lightweight and easy to run during the limited development time.

I used JWT for authentication and bcrypt for password hashing.

For the UI, I used Tailwind CSS and Lucide React icons to make the application look cleaner without spending too much time writing custom CSS.

---

## 3. How I designed the database

I did not want to keep everything in one table because doctors, patients and appointments are different entities.

So I created separate tables for:

* Users
* Doctors
* Patients
* Appointments
* Notifications

The appointment table connects a patient with a doctor using foreign keys.

I also added indexes for commonly searched appointment and patient information.

For appointments, I used different statuses such as:

* CONFIRMED
* COMPLETED
* CANCELLED
* NO_SHOW

This makes it easier to track what happened to every appointment.

---

## 4. How I handled login

For registration, I do not store the user's actual password in the database.

The password is first hashed using bcrypt and then the hash is stored.

During login, I compare the entered password with the stored hash. If it is correct, I generate a JWT token.

The frontend stores the token and sends it with protected API requests.

This way, important operations such as appointments and patient information are protected on the backend.

---

## 5. How I prevented doctor double-booking

This was one of the main parts of my project.

Before creating an appointment, I check whether the same doctor already has an appointment that overlaps with the requested time.

The basic condition I used is:

```text
new_start < existing_end
AND
new_end > existing_start
```

For example:

```text
Existing: 09:00 – 09:30
New:      09:15 – 09:45
```

This should not be allowed because the timings overlap.

But:

```text
Existing: 09:00 – 09:30
New:      09:30 – 10:00
```

is allowed because the second appointment starts exactly when the first one ends.

I kept this validation on the backend instead of depending only on the frontend. This is important because someone could otherwise bypass the UI and directly call the API.

---

## 6. Cancellation logic

I implemented the cancellation rule on the backend.

My rule is:

* If the appointment is cancelled 2 hours or more before the appointment → ₹0 fee
* If it is cancelled less than 2 hours before the appointment → ₹500 fee

The cancellation fee and cancellation time are stored in the appointment record.

This makes it clear why a particular cancellation fee was applied.

---

## 7. Rescheduling

For rescheduling, I used the same overlap checking logic as appointment booking.

When an appointment is moved to a new date or time, the backend checks the new slot again.

While checking the overlap, the current appointment itself is excluded from the check. Otherwise, an appointment could incorrectly conflict with itself.

Only after the new slot passes validation is the appointment updated.

---

## 8. Automatic reminders and NO_SHOW

I also implemented a clock API:

```text
POST /api/clock
```

The idea is that this endpoint represents the clinic's automatic background clock job.

For today's confirmed appointments, it can create reminder notifications.

I also added the no-show rule. If an appointment has started and 30 minutes have passed without it being completed, the appointment can be changed to:

```text
NO_SHOW
```

I created a notifications table so these generated reminders can be stored.

I also added:

```text
GET /api/outbox
```

so that the generated notifications can be viewed.

---

## 9. Search, pagination and sorting

For patients, I added search using information such as:

* Patient ID
* Name
* Phone
* Email

For appointments, I added search as well as pagination and sorting.

I used these features because a clinic may eventually have a large number of patients and appointments, and showing everything on one page would not be practical.

---

## 10. How I designed the UI

I wanted the UI to be simple enough for a receptionist to understand without much training.

The main sections are:

* Dashboard
* Appointments
* Book Appointment
* Patients
* Doctors

The dashboard gives a quick overview of appointments, patients and doctors.

The appointment page is used to search and manage appointments.

The patient page allows the receptionist to search for a patient and open their appointment history.

The doctor page shows the available doctors and their schedules.

---

## 11. Testing I did during development

I tested the backend APIs step by step while developing the project.

I checked:

* User login
* Doctor listing
* Doctor schedule
* Patient listing
* Patient search
* Patient appointment history
* Appointment listing
* Clock API
* Frontend to backend connection

I also tested the login API directly using curl to make sure that the backend and database were working correctly.

After connecting the frontend, I tested the actual login from the UI and confirmed that the dashboard was able to load data from the backend.

---

## 12. Problems I faced and how I fixed them

### React Router issue

Initially, my Login component was using `useNavigate()` before it was inside `BrowserRouter`.

This caused the error:

```text
useNavigate() may be used only in the context of a Router
```

I fixed this by moving `BrowserRouter` around both the login and authenticated parts of the application.

### Tailwind CSS issue

Initially, the frontend was loading but the Tailwind styling was not working.

I installed the required Tailwind packages and configured the Vite plugin.

After that, the UI started displaying correctly.

### Backend connection issue in Codespaces

Initially, the frontend was trying to directly call:

```text
http://localhost:5000/api
```

This caused a connection problem when accessing the frontend through GitHub Codespaces.

I solved this by changing the frontend API base URL to:

```text
/api
```

and configuring the Vite development proxy to forward `/api` requests to the Express server running on port 5000.

After this change, the frontend was successfully able to communicate with the backend.

---

## 13. Final architecture

The final flow of my application is:

```text
React Frontend
      |
      | REST API
      ↓
Express Backend
      |
      | Business Logic
      ↓
SQLite Database
```

The database contains separate tables for users, doctors, patients, appointments and notifications.

Authentication and important appointment rules are handled on the backend.

---

## 14. My main priorities while building the project

Because the project had to be completed within a limited time, I first focused on making the core workflow functional.

My priority order was:

1. Database
2. Backend APIs
3. Authentication
4. Appointment conflict checking
5. Cancellation and rescheduling
6. Automation
7. Frontend UI
8. Testing and fixing issues
9. Documentation

The main goal was to make sure that the important business rules were handled by the server and that the front desk user could actually use the system through the UI.
