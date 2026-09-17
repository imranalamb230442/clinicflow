const db = require("../database/db");

const createPatient = (req, res) => {
    try {
        const { patient_code, name, phone, email } = req.body;

        if (!patient_code || !name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Patient code, name and phone are required"
            });
        }

        const existing = db.prepare(
            "SELECT id FROM patients WHERE patient_code = ?"
        ).get(patient_code);

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Patient code already exists"
            });
        }

        const result = db.prepare(`
            INSERT INTO patients (patient_code, name, phone, email)
            VALUES (?, ?, ?, ?)
        `).run(patient_code, name, phone, email || null);

        const patient = db.prepare(
            "SELECT * FROM patients WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: patient
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create patient"
        });
    }
};

const getPatients = (req, res) => {
    try {
        const patients = db.prepare(`
            SELECT *
            FROM patients
            ORDER BY name ASC
        `).all();

        res.json({
            success: true,
            data: patients
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patients"
        });
    }
};

const searchPatients = (req, res) => {
    try {
        const q = (req.query.q || "").trim();

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const search = `%${q}%`;

        const patients = db.prepare(`
            SELECT *
            FROM patients
            WHERE patient_code LIKE ?
               OR name LIKE ?
               OR phone LIKE ?
               OR email LIKE ?
            ORDER BY name ASC
        `).all(search, search, search, search);

        res.json({
            success: true,
            data: patients
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to search patients"
        });
    }
};

const getPatientById = (req, res) => {
    try {
        const patient = db.prepare(
            "SELECT * FROM patients WHERE id = ?"
        ).get(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient"
        });
    }
};

const getPatientAppointments = (req, res) => {
    try {
        const patient = db.prepare(
            "SELECT id, patient_code, name FROM patients WHERE id = ?"
        ).get(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const appointments = db.prepare(`
            SELECT
                a.id,
                a.appointment_date,
                a.start_time,
                a.end_time,
                a.status,
                a.cancellation_fee,
                d.id AS doctor_id,
                d.name AS doctor_name,
                d.specialization
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC, a.start_time DESC
        `).all(req.params.id);

        res.json({
            success: true,
            data: {
                patient,
                appointments
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient appointments"
        });
    }
};

module.exports = {
    createPatient,
    getPatients,
    searchPatients,
    getPatientById,
    getPatientAppointments
};
