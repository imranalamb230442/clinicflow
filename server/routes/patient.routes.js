const express = require("express");

const {
    createPatient,
    getPatients,
    searchPatients,
    getPatientById,
    getPatientAppointments
} = require("../controllers/patient.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPatient);
router.get("/", getPatients);
router.get("/search", searchPatients);
router.get("/:id/appointments", getPatientAppointments);
router.get("/:id", getPatientById);

module.exports = router;
