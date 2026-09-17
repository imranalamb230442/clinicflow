const express = require("express");

const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    cancelAppointment,
    rescheduleAppointment
} = require("../controllers/appointment.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createAppointment);
router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.patch("/:id/cancel", cancelAppointment);
router.patch("/:id/reschedule", rescheduleAppointment);

module.exports = router;