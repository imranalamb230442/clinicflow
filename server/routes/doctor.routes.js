const express = require("express");

const {
    getDoctors,
    getDoctorById,
    getDoctorSchedule
} = require("../controllers/doctor.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getDoctors);
router.get("/:id/schedule", getDoctorSchedule);
router.get("/:id", getDoctorById);

module.exports = router;