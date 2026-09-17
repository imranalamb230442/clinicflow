const db = require("../database/db");

const runClock = (req, res) => {
    try {
        const now = new Date();

        // Mark appointments as NO_SHOW if they started
        // more than 30 minutes ago and are still CONFIRMED.
        const noShowResult = db.prepare(`
            UPDATE appointments
            SET status = 'NO_SHOW'
            WHERE status = 'CONFIRMED'
              AND datetime(appointment_date || ' ' || start_time, '+30 minutes') <= datetime('now')
        `).run();

        // Create today's morning reminders.
        const today = now.toISOString().slice(0, 10);

        const todayAppointments = db.prepare(`
            SELECT
                a.id,
                a.appointment_date,
                a.start_time,
                d.name AS doctor_name,
                p.id AS patient_id,
                p.name AS patient_name
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            JOIN patients p ON p.id = a.patient_id
            WHERE a.appointment_date = ?
              AND a.status = 'CONFIRMED'
        `).all(today);

        const insertNotification = db.prepare(`
            INSERT INTO notifications
            (appointment_id, patient_id, type, message)
            VALUES (?, ?, 'APPOINTMENT_REMINDER', ?)
        `);

        let reminders = 0;

        for (const appointment of todayAppointments) {
            const existing = db.prepare(`
                SELECT id
                FROM notifications
                WHERE appointment_id = ?
                  AND type = 'APPOINTMENT_REMINDER'
                  AND date(created_at) = date('now')
            `).get(appointment.id);

            if (!existing) {
                insertNotification.run(
                    appointment.id,
                    appointment.patient_id,
                    `Reminder: ${appointment.patient_name} has an appointment today at ${appointment.start_time} with ${appointment.doctor_name}.`
                );

                reminders++;
            }
        }

        res.json({
            success: true,
            message: "Clock job executed",
            data: {
                no_show_marked: noShowResult.changes,
                reminders_created: reminders
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Clock job failed"
        });
    }
};

const getOutbox = (req, res) => {
    try {
        const notifications = db.prepare(`
            SELECT *
            FROM notifications
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch notification outbox"
        });
    }
};

module.exports = {
    runClock,
    getOutbox
};
