const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendEmergencyAlert,
  getEmergencyAlerts,
  acknowledgeEmergency,
  updateEmergencyLocation,
  markParentCalled,
  markSafe
} = require("../controllers/emergencyController");

// Send emergency SOS alert
router.post("/:childId/sos", authMiddleware, sendEmergencyAlert);

// Get emergency alerts
router.get("/:childId/alerts", authMiddleware, getEmergencyAlerts);

// Acknowledge emergency
router.post("/:alertId/acknowledge", authMiddleware, acknowledgeEmergency);

// Update real-time location during emergency
router.post("/:alertId/update-location", authMiddleware, updateEmergencyLocation);

// Parent marks they called child
router.post("/:alertId/mark-called", authMiddleware, markParentCalled);

// Mark situation as safe
router.post("/:alertId/mark-safe", authMiddleware, markSafe);

module.exports = router;
