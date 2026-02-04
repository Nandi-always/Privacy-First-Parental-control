const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  updateLocation,
  getLiveLocation,
  getLocationHistory,
  getLocationStats,
  updateGeofence
} = require("../controllers/locationController");

// Update live location
router.post("/:childId/update", authMiddleware, updateLocation);

// Get live location
router.get("/:childId/live", authMiddleware, getLiveLocation);

// Get location history
router.get("/:childId/history", authMiddleware, getLocationHistory);

// Get location statistics
router.get("/:childId/stats", authMiddleware, getLocationStats);

// Update geofence settings
router.post("/geofence", authMiddleware, updateGeofence);

module.exports = router;
