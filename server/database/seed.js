const db = require("./db");

console.log("🌱 Seeding ClinicFlow database...");

// Clear existing demo data
db.prepare("DELETE FROM appointments").run();
db.prepare("DELETE FROM patients").run();
db.prepare("DELETE FROM doctors").run();

// Doctors
const insertDoctor = db.prepare(`
    INSERT INTO doctors (name, specialization)
    VALUES (?, ?)
`);

const doctors = [
    ["Dr. Ananya Sharma", "Cardiology"],
    ["Dr. Rajiv Mehta", "General Medicine"],
    ["Dr. Priya Kapoor", "Dermatology"],
    ["Dr. Arjun Verma", "Orthopedics"],
    ["Dr. Neha Singh", "Pediatrics"]
];

for (const doctor of doctors) {
    insertDoctor.run(...doctor);
}

// Patients
const insertPatient = db.prepare(`
    INSERT INTO patients (patient_code, name, phone, email)
    VALUES (?, ?, ?, ?)
`);

const patients = [
    ["P-10001", "Rahul Sharma", "9876543210", "rahul.sharma@example.com"],
    ["P-10002", "Rahul Kumar", "9123456780", "rahul.kumar@example.com"],
    ["P-10003", "Priya Mehta", "9988776655", "priya.mehta@example.com"],
    ["P-10004", "Amit Verma", "9012345678", "amit.verma@example.com"],
    ["P-10005", "Sneha Gupta", "9090909090", "sneha.gupta@example.com"],
    ["P-10006", "Arjun Singh", "9876501234", "arjun.singh@example.com"],
    ["P-10007", "Kavya Joshi", "8765432109", "kavya.joshi@example.com"],
    ["P-10008", "Mohit Agarwal", "7890123456", "mohit.agarwal@example.com"]
];

for (const patient of patients) {
    insertPatient.run(...patient);
}

// Demo appointments
const insertAppointment = db.prepare(`
    INSERT INTO appointments (
        doctor_id,
        patient_id,
        appointment_date,
        start_time,
        end_time,
        status,
        cancellation_fee
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const demoAppointments = [
    [1, 1, "2026-09-25", "09:00", "09:30", "CONFIRMED", 0],
    [1, 3, "2026-09-25", "10:00", "10:30", "CONFIRMED", 0],
    [1, 4, "2026-09-25", "11:00", "11:30", "CONFIRMED", 0],

    [2, 2, "2026-09-25", "09:30", "10:00", "CONFIRMED", 0],
    [2, 5, "2026-09-25", "10:30", "11:00", "CONFIRMED", 0],

    [3, 6, "2026-09-25", "10:00", "10:30", "CONFIRMED", 0],
    [4, 7, "2026-09-25", "11:00", "11:30", "CONFIRMED", 0],
    [5, 8, "2026-09-25", "12:00", "12:30", "CONFIRMED", 0]
];

for (const appointment of demoAppointments) {
    insertAppointment.run(...appointment);
}

console.log("✅ Database seeded successfully");
console.log(`👨‍⚕️ Doctors: ${doctors.length}`);
console.log(`👤 Patients: ${patients.length}`);
console.log(`📅 Appointments: ${demoAppointments.length}`);

db.close();