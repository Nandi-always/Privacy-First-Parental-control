const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  logAppDownload,
  getDownloadAlerts,
  approveOrBlockApp
} = require("../controllers/downloadAlertController");

// Log app download
router.post("/:childId/log", authMiddleware, logAppDownload);

// Get download alerts
router.get("/:childId/alerts", authMiddleware, getDownloadAlerts);

// Approve or block app
router.put("/:alertId/action", authMiddleware, approveOrBlockApp);

module.exports = router;
