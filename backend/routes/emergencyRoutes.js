const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendEmergencyAlert,
  getEmergencyAlerts,
  acknowledgeEmergency
} = require("../controllers/emergencyController");

// Send emergency SOS alert
router.post("/:childId/sos", authMiddleware, sendEmergencyAlert);

// Get emergency alerts
router.get("/:childId/alerts", authMiddleware, getEmergencyAlerts);

// Acknowledge emergency alert
router.put("/:alertId/acknowledge", authMiddleware, acknowledgeEmergency);

module.exports = router;
