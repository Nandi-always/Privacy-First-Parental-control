const Location = require("../models/Location");
const Child = require("../models/Child");

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
