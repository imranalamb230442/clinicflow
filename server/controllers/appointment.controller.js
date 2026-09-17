const db = require("../database/db");

const createAppointment = (req, res) => {
    try {
        const {
            doctor_id,
            patient_id,
            appointment_date,
            start_time,
            end_time
        } = req.body;

        if (
            !doctor_id ||
            !patient_id ||
            !appointment_date ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                success: false,
                message: "Doctor, patient, date, start time and end time are required"
            });
        }

        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        const doctor = db.prepare(
            "SELECT id, name, specialization FROM doctors WHERE id = ?"
        ).get(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        const patient = db.prepare(
            "SELECT id, patient_code, name FROM patients WHERE id = ?"
        ).get(patient_id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Prevent doctor double-booking / overlapping appointments.
        const conflict = db.prepare(`
            SELECT id, start_time, end_time
            FROM appointments
            WHERE doctor_id = ?
              AND appointment_date = ?
              AND status != 'CANCELLED'
              AND start_time < ?
              AND end_time > ?
            LIMIT 1
        `).get(
            doctor_id,
            appointment_date,
            end_time,
            start_time
        );

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "Doctor already has an overlapping appointment",
                conflict: {
                    appointment_id: conflict.id,
                    start_time: conflict.start_time,
                    end_time: conflict.end_time
                }
            });
        }

        const result = db.prepare(`
            INSERT INTO appointments (
                doctor_id,
                patient_id,
                appointment_date,
                start_time,
                end_time,
                status,
                cancellation_fee
            )
            VALUES (?, ?, ?, ?, ?, 'CONFIRMED', 0)
        `).run(
            doctor_id,
            patient_id,
            appointment_date,
            start_time,
            end_time
        );

        const appointment = db.prepare(`
            SELECT
                a.*,
                d.name AS doctor_name,
                d.specialization,
                p.patient_code,
                p.name AS patient_name,
                p.phone AS patient_phone
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            JOIN patients p ON p.id = a.patient_id
            WHERE a.id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create appointment"
        });
    }
};


const getAppointments = (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 10, 1),
            100
        );

        const offset = (page - 1) * limit;

        const allowedSortFields = {
            appointment_date: "a.appointment_date",
            start_time: "a.start_time",
            status: "a.status",
            doctor_name: "d.name",
            patient_name: "p.name"
        };

        const sortBy = allowedSortFields[req.query.sortBy]
            || "a.appointment_date";

        const order = String(req.query.order).toLowerCase() === "desc"
            ? "DESC"
            : "ASC";

        const search = (req.query.search || "").trim();

        let where = "WHERE 1 = 1";
        const params = [];

        if (search) {
            where += `
                AND (
                    p.name LIKE ?
                    OR p.patient_code LIKE ?
                    OR p.phone LIKE ?
                    OR d.name LIKE ?
                )
            `;

            const searchValue = `%${search}%`;

            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        const countResult = db.prepare(`
            SELECT COUNT(*) AS total
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            JOIN patients p ON p.id = a.patient_id
            ${where}
        `).get(...params);

        const appointments = db.prepare(`
            SELECT
                a.*,
                d.name AS doctor_name,
                d.specialization,
                p.patient_code,
                p.name AS patient_name,
                p.phone AS patient_phone
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            JOIN patients p ON p.id = a.patient_id
            ${where}
            ORDER BY ${sortBy} ${order}
            LIMIT ? OFFSET ?
        `).all(...params, limit, offset);

        const total = countResult.total;

        res.json({
            success: true,
            data: appointments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            sorting: {
                sortBy: req.query.sortBy || "appointment_date",
                order
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch appointments"
        });
    }
};


const getAppointmentById = (req, res) => {
    try {
        const appointment = db.prepare(`
            SELECT
                a.*,
                d.name AS doctor_name,
                d.specialization,
                p.patient_code,
                p.name AS patient_name,
                p.phone AS patient_phone,
                p.email AS patient_email
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            JOIN patients p ON p.id = a.patient_id
            WHERE a.id = ?
        `).get(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch appointment"
        });
    }
};


const cancelAppointment = (req, res) => {
    try {
        const appointment = db.prepare(`
            SELECT *
            FROM appointments
            WHERE id = ?
        `).get(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (appointment.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Appointment is already cancelled"
            });
        }

        const appointmentDateTime = new Date(
            `${appointment.appointment_date}T${appointment.start_time}:00`
        );

        const now = new Date();

        const hoursRemaining =
            (appointmentDateTime.getTime() - now.getTime()) /
            (1000 * 60 * 60);

        // Cancellation policy:
        // 2 hours or more before appointment = FREE
        // Less than 2 hours = ₹500
        const cancellationFee = hoursRemaining >= 2 ? 0 : 500;

        const cancelledAt = new Date().toISOString();

        db.prepare(`
            UPDATE appointments
            SET status = 'CANCELLED',
                cancellation_fee = ?,
                cancelled_at = ?
            WHERE id = ?
        `).run(
            cancellationFee,
            cancelledAt,
            req.params.id
        );

        const updatedAppointment = db.prepare(`
            SELECT
                a.*,
                d.name AS doctor_name,
                p.patient_code,
                p.name AS patient_name
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            JOIN patients p ON p.id = a.patient_id
            WHERE a.id = ?
        `).get(req.params.id);

        res.json({
            success: true,
            message: cancellationFee === 0
                ? "Appointment cancelled without fee"
                : "Appointment cancelled with ₹500 late-cancellation fee",
            data: {
                appointment: updatedAppointment,
                hours_remaining: Math.max(hoursRemaining, 0),
                cancellation_fee: cancellationFee
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to cancel appointment"
        });
    }
};

const rescheduleAppointment = (req, res) => {
    try {
        const {
            appointment_date,
            start_time,
            end_time
        } = req.body;

        if (!appointment_date || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: "Date, start time and end time are required"
            });
        }

        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        const appointment = db.prepare(`
            SELECT *
            FROM appointments
            WHERE id = ?
        `).get(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (appointment.status !== "CONFIRMED") {
            return res.status(400).json({
                success: false,
                message: "Only confirmed appointments can be rescheduled"
            });
        }

        const conflict = db.prepare(`
            SELECT id, start_time, end_time
            FROM appointments
            WHERE doctor_id = ?
              AND appointment_date = ?
              AND id != ?
              AND status = 'CONFIRMED'
              AND start_time < ?
              AND end_time > ?
            LIMIT 1
        `).get(
            appointment.doctor_id,
            appointment_date,
            appointment.id,
            end_time,
            start_time
        );

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "Cannot reschedule: doctor has an overlapping appointment",
                conflict
            });
        }

        db.prepare(`
            UPDATE appointments
            SET appointment_date = ?,
                start_time = ?,
                end_time = ?
            WHERE id = ?
        `).run(
            appointment_date,
            start_time,
            end_time,
            appointment.id
        );

        const updated = db.prepare(`
            SELECT
                a.*,
                d.name AS doctor_name,
                p.patient_code,
                p.name AS patient_name
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            JOIN patients p ON p.id = a.patient_id
            WHERE a.id = ?
        `).get(appointment.id);

        res.json({
            success: true,
            message: "Appointment rescheduled successfully",
            data: updated
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to reschedule appointment"
        });
    }
};


module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    cancelAppointment,
    rescheduleAppointment
};