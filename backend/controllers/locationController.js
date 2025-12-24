const Location = require("../models/Location");
const Child = require("../models/Child");

// Update live location
exports.updateLocation = async (req, res) => {
  try {
    const { childId } = req.params;
    const { latitude, longitude, address, accuracy } = req.body;

    // Remove old live location
    await Location.updateMany(
      { child: childId, isLive: true },
      { isLive: false }
    );

    // Create new live location
    const location = new Location({
      child: childId,
      parent: req.user.id,
      latitude,
      longitude,
      address,
      accuracy,
      isLive: true
    });

    await location.save();
    res.status(201).json({ message: "Location updated", location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get live location of child
exports.getLiveLocation = async (req, res) => {
  try {
    const { childId } = req.params;

    const location = await Location.findOne({
      child: childId,
      parent: req.user.id,
      isLive: true
    });

    res.status(200).json(location || { message: "No live location available" });
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
