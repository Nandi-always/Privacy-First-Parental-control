const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getDailyActivitySummary,
  getWeeklyInsights,
  get30DayReport,
  getRealtimeStatus
} = require("../controllers/reportController");

// Daily activity summary
router.get("/:childId/daily", authMiddleware, getDailyActivitySummary);

// Weekly insights
router.get("/:childId/weekly", authMiddleware, getWeeklyInsights);

// 30-day report
router.get("/:childId/monthly", authMiddleware, get30DayReport);

// Real-time activity status
router.get("/:childId/realtime", authMiddleware, getRealtimeStatus);

module.exports = router;
