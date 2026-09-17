const express = require("express");

const {
    runClock,
    getOutbox
} = require("../controllers/automation.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/clock", runClock);
router.get("/outbox", getOutbox);

module.exports = router;
