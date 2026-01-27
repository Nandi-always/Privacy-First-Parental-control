const express = require("express");
const router = express.Router();
const {
    detectRiskyActivity,
    getRiskyActivities,
    acknowledgeAlert,
    getAlertStats
} = require("../controllers/riskyActivityController");
const authMiddleware = require("../middleware/authMiddleware");

// Detect risky activity for a child
router.post("/:childId/detect", authMiddleware, detectRiskyActivity);

// Get risky activities for a child
router.get("/:childId", authMiddleware, getRiskyActivities);

// Get alert statistics
router.get("/:childId/stats", authMiddleware, getAlertStats);

// Acknowledge an alert
router.put("/:alertId/acknowledge", authMiddleware, acknowledgeAlert);

module.exports = router;
