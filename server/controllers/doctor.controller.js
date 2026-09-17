const db = require("../database/db");

const getDoctors = (req, res, next) => {
    try {
        const doctors = db.prepare(`
            SELECT
                id,
                name,
                specialization,
                created_at
            FROM doctors
            ORDER BY name ASC
        `).all();

        res.json({
            success: true,
            data: doctors
        });
    } catch (error) {
        next(error);
    }
};

const getDoctorById = (req, res, next) => {
    try {
        const doctor = db.prepare(`
            SELECT
                id,
                name,
                specialization,
                created_at
            FROM doctors
            WHERE id = ?
        `).get(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        next(error);
    }
};

const getDoctorSchedule = (req, res, next) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date query parameter is required"
            });
        }

        const doctor = db.prepare(`
            SELECT id, name, specialization
            FROM doctors
            WHERE id = ?
        `).get(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
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
                p.id AS patient_id,
                p.patient_code,
                p.name AS patient_name,
                p.phone AS patient_phone
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            WHERE a.doctor_id = ?
              AND a.appointment_date = ?
            ORDER BY a.start_time ASC
        `).all(req.params.id, date);

        res.json({
            success: true,
            data: {
                doctor,
                date,
                appointments
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDoctors,
    getDoctorById,
    getDoctorSchedule
};