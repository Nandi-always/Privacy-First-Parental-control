const Location = require("../models/Location");
const Child = require("../models/Child");
const Notification = require("../models/Notification");

// Haversine formula to calculate distance between two points in meters
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Mock location data for testing
const mockLocations = [
  { address: "Home - 123 Main Street, City, State", accuracy: 10 },
  { address: "School - 456 Education Ave, City, State", accuracy: 15 },
  { address: "Park - Central Park, City, State", accuracy: 20 },
  { address: "Library - 789 Knowledge St, City, State", accuracy: 12 },
  { address: "Shopping Center - 321 Market Rd, City, State", accuracy: 18 },
];

// Get random mock location
const getRandomLocation = () => {
  return mockLocations[Math.floor(Math.random() * mockLocations.length)];
};

// Update live location
exports.updateLocation = async (req, res) => {
  try {
    const { childId } = req.params;
    const { latitude, longitude, address, accuracy } = req.body;

    // Fetch child to get parent ID and geofence settings
    const User = require("../models/User");
    const child = await Child.findById(childId) || await User.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child identification missing" });
    }
    const parentId = child.parent || child.parentId;
    if (!parentId) {
      return res.status(404).json({ message: "Parent not found for this child" });
    }

    // Remove old live location
    await Location.updateMany(
      { child: childId, isLive: true },
      { isLive: false }
    );

    // Create new live location
    const location = new Location({
      child: childId,
      parent: child.parent, // Use parent ID from child document
      latitude,
      longitude,
      address,
      accuracy,
      isLive: true
    });

    await location.save();

    // Send notification for manual/live update
    const checkinNotif = new Notification({
      senderId: childId,
      receiverId: parentId,
      message: `${child.name} reported their current location: ${address || 'Coordinates provided'}`,
      type: "alert",
      isRead: false
    });
    await checkinNotif.save();

    // Geofence Check (Privacy-First Event Based)
    const currentTime = new Date();
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHourMin = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

    if (child && child.geofences && child.geofences.length > 0) {
      const updatedGeofences = [...child.geofences];
      let changesMade = false;

      for (let i = 0; i < updatedGeofences.length; i++) {
        const zone = updatedGeofences[i];
        if (!zone.enabled) continue;

        // 1. Time-Bound Check
        const withinDay = !zone.days || zone.days.length === 0 || zone.days.includes(currentDay);
        const withinTime = (!zone.startTime || currentHourMin >= zone.startTime) &&
          (!zone.endTime || currentHourMin <= zone.endTime);

        if (withinDay && withinTime) {
          const distance = getDistance(latitude, longitude, zone.latitude, zone.longitude);
          const isInside = distance <= (zone.radius || 200);
          const newStatus = isInside ? "inside" : "outside";

          // 2. Event-Based Alert (Only if status changed)
          if (zone.lastStatus !== "unknown" && zone.lastStatus !== newStatus) {
            const eventType = newStatus === "inside" ? "Entered" : "Left";
            const message = `PV-EVENT: ${child.name} ${eventType} ${zone.name} zone.`;

            // Create notification for parent
            const notification = new Notification({
              senderId: childId,
              receiverId: parentId,
              message: message,
              type: "alert",
              isRead: false
            });
            await notification.save();
            console.log(`🔔 Privacy Event: ${message}`);
          }

          zone.lastStatus = newStatus;
          changesMade = true;
        } else {
          // Outside monitoring window, reset status
          if (zone.lastStatus !== "unknown") {
            zone.lastStatus = "unknown";
            changesMade = true;
          }
        }
      }

      if (changesMade) {
        child.geofences = updatedGeofences;
        await child.save();
      }
    }

    res.status(201).json({ message: "Location updated", location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Geofence Settings
exports.updateGeofence = async (req, res) => {
  try {
    const { childId, geofence } = req.body;

    if (!childId || !geofence) {
      return res.status(400).json({ message: "Missing childId or geofence data" });
    }

    const updatedChild = await Child.findOneAndUpdate(
      { _id: childId, parent: req.user.id },
      { geofence },
      { new: true }
    );

    if (!updatedChild) {
      return res.status(404).json({ message: "Child not found or unauthorized" });
    }

    res.status(200).json({ message: "Geofence updated successfully", geofence: updatedChild.geofence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get live location of child
exports.getLiveLocation = async (req, res) => {
  try {
    const { childId } = req.params;

    let location = await Location.findOne({
      child: childId,
      parent: req.user.id,
      isLive: true
    });

    // If no location exists, create mock location for demo
    if (!location) {
      const mockLoc = getRandomLocation();
      location = new Location({
        child: childId,
        parent: req.user.id,
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
        address: mockLoc.address,
        accuracy: mockLoc.accuracy,
        isLive: true,
        timestamp: new Date()
      });
      await location.save();
    }

    res.status(200).json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get location history
exports.getLocationHistory = async (req, res) => {
  try {
    const { childId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await Location.find({
      child: childId,
      parent: req.user.id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get location statistics (most visited places)
exports.getLocationStats = async (req, res) => {
  try {
    const { childId } = req.params;

    const locations = await Location.find({
      child: childId,
      parent: req.user.id
    });

    // Group by address and count
    const stats = {};
    locations.forEach(loc => {
      if (loc.address) {
        stats[loc.address] = (stats[loc.address] || 0) + 1;
      }
    });

    // Sort by frequency
    const sorted = Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    res.status(200).json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
