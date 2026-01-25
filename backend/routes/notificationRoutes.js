const express = require("express");
const router = express.Router();
const {
    sendNotification,
    getNotifications,
    markAsRead,
} = require("../controllers/notificationController");
const auth = require("../middleware/authMiddleware");

// All routes require authentication
router.use(auth);

// Get notifications
router.get("/", getNotifications);

// Send notification
router.post("/send", sendNotification);

// Mark as read
router.put("/:id/read", markAsRead);

module.exports = router;
