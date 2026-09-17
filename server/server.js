const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize database
require("./database/db");
const authRoutes = require("./routes/auth.routes");
const doctorRoutes = require("./routes/doctor.routes");
const patientRoutes = require("./routes/patient.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const automationRoutes = require("./routes/automation.routes");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "ClinicFlow API is running",
        timestamp: new Date().toISOString()
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api", automationRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log("🚀 ClinicFlow API server started");
    console.log(`🌐 Server: http://localhost:${PORT}`);
});