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
    const childId = String(req.params.childId);
    const { latitude, longitude, address, accuracy } = req.body;

    console.log(`📍 Received location update for child: ${childId}`);

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    // Fetch child to get parent ID and geofence settings
    const User = require("../models/User");
    let child = await Child.findById(childId);
    if (!child) {
      child = await User.findById(childId);
    }

    if (!child) {
      console.error(`❌ Child not found for ID: ${childId}`);
      return res.status(404).json({ message: "Child account not found in system" });
    }

    // Safely extract data using toObject() to avoid conflict with Mongoose .parent() function
    const childData = child.toObject();
    let parentId = childData.parent || childData.parentId;

    // Fallback: If no parent linked, find the first parent in DB for demo purposes
    if (!parentId) {
      console.warn(`⚠️ No parent linked to child ${childId}, searching for fallback parent...`);
      const fallbackParent = await User.findOne({ role: 'parent' });
      if (fallbackParent) {
        parentId = fallbackParent._id;
        console.log(`   Using fallback parent: ${parentId}`);
      }
    }

    if (!parentId) {
      console.error(`❌ No parent account found to report to`);
      return res.status(400).json({ message: "Your account is not linked to any parent. Please link your account first." });
    }

    // Remove old live location
    try {
      await Location.updateMany(
        { child: childId, isLive: true },
        { isLive: false }
      );
    } catch (err) {
      console.warn('   Could not update old live locations:', err.message);
    }

    // Create new live location
    const location = new Location({
      child: childId,
      parent: parentId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || 'Current Location',
      accuracy: accuracy || 10,
      isLive: true
    });

    await location.save();
    console.log(`✅ Location saved successfully for child ${childId}`);

    // Send notification for manual/live update
    try {
      const checkinNotif = new Notification({
        senderId: childId,
        receiverId: parentId,
        message: `${child.name || 'Your child'} reported their current location: ${address || 'Coordinates provided'}`,
        type: "alert",
        isRead: false
      });
      await checkinNotif.save();
      console.log(`🔔 Notification sent to parent: ${parentId}`);
    } catch (notifErr) {
      console.error(`⚠️ Notification failed:`, notifErr.message);
    }

    // Geofence Check (Privacy-First Event Based)
    try {
      if (child && child.geofences && child.geofences.length > 0) {
        const currentTime = new Date();
        const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
        const currentHourMin = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

        const updatedGeofences = [...child.geofences];
        let changesMade = false;

        for (let i = 0; i < updatedGeofences.length; i++) {
          const zone = updatedGeofences[i];
          if (!zone.enabled) continue;

          const withinDay = !zone.days || zone.days.length === 0 || zone.days.includes(currentDay);
          const withinTime = (!zone.startTime || currentHourMin >= zone.startTime) &&
            (!zone.endTime || currentHourMin <= zone.endTime);

          if (withinDay && withinTime) {
            const distance = getDistance(latitude, longitude, zone.latitude, zone.longitude);
            const isInside = distance <= (zone.radius || 200);
            const newStatus = isInside ? "inside" : "outside";

            if (zone.lastStatus !== "unknown" && zone.lastStatus !== newStatus) {
              const eventType = newStatus === "inside" ? "Entered" : "Left";
              const notification = new Notification({
                senderId: childId,
                receiverId: parentId,
                message: `PV-EVENT: ${child.name} ${eventType} ${zone.name} zone.`,
                type: "alert",
                isRead: false
              });
              await notification.save();
            }

            zone.lastStatus = newStatus;
            changesMade = true;
          }
        }

        if (changesMade && child.save && typeof child.save === 'function') {
          await child.save();
        }
      }
    } catch (geofenceErr) {
      console.error(`⚠️ Geofence failed:`, geofenceErr.message);
    }

    res.status(201).json({ message: "Location updated successfully", location });
  } catch (err) {
    console.error(`❌ Critical error in updateLocation:`, err);
    res.status(500).json({ message: "Server error during location report", error: err.message });
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
