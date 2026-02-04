const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
    getAlerts,
    createAlert,
    markAsRead,
    acknowledgeAlert,
    deleteAlert,
    getUnreadCount
} = require("../controllers/alertController");

// All routes require authentication
router.use(auth);

// Get alerts
router.get("/", getAlerts);

// Get unread count
router.get("/unread/count", getUnreadCount);

// Create alert
router.post("/", createAlert);

// Mark as read
router.put("/:id/read", markAsRead);

// Acknowledge alert
router.put("/:id/acknowledge", acknowledgeAlert);

// Delete alert
router.delete("/:id", deleteAlert);

module.exports = router;
