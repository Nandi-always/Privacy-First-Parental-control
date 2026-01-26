const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  logAppUsage,
  getDailyScreenTime,
  getScreenTimeHistory,
  pauseInternetAccess,
  setDailyLimit,
  getScreenTimeSettings,
  updateScreenTimeSettings
} = require("../controllers/screenTimeController");

// Log app usage
router.post("/:childId/log", authMiddleware, logAppUsage);

// Get daily screen time
router.get("/:childId/daily", authMiddleware, getDailyScreenTime);

// Get screen time history
router.get("/:childId/history", authMiddleware, getScreenTimeHistory);

// Pause internet access
router.post("/:childId/pause", authMiddleware, pauseInternetAccess);

// Set daily screen time limit
router.post("/:childId/limit", authMiddleware, setDailyLimit);

// Get and update screen time settings
router.get("/:childId/settings", authMiddleware, getScreenTimeSettings);
router.put("/:childId/settings", authMiddleware, updateScreenTimeSettings);

module.exports = router;
