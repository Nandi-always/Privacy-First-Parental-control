const Child = require("../models/Child");
const Notification = require("../models/Notification");

// Create a new child
exports.createChild = async (req, res) => {
  try {
    const { name, email, age, deviceId, deviceModel, osVersion } = req.body;

    const existingChild = await Child.findOne({ email });
    if (existingChild) return res.status(400).json({ message: "Child already exists" });

    const child = new Child({
      name,
      email,
      age,
      deviceId,
      deviceModel,
      osVersion,
      parent: req.user.id
    });

    await child.save();
    res.status(201).json({ message: "Child created successfully", child });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all children for the logged-in parent
exports.getChildren = async (req, res) => {
  try {
    console.log('📋 Fetching children for parent:', req.user.id);

    // Get Child records (from Child model)
    const childRecords = await Child.find({ parent: req.user.id });
    console.log(`   Found ${childRecords.length} Child records`);

    // Get User accounts with role='child' linked to this parent
    const User = require("../models/User");
    const childUsers = await User.find({
      role: 'child',
      parentId: req.user.id
    }).select('-password'); // exclude password field

    console.log(`   Found ${childUsers.length} User accounts with role=child`);

    // Combine both - Child records take priority, then add unique User accounts
    const childMap = new Map();

    // Add Child records first
    childRecords.forEach(child => {
      childMap.set(child.email, child);
    });

    // Add User accounts that don't have corresponding Child records
    childUsers.forEach(user => {
      if (!childMap.has(user.email)) {
        // Convert User to Child-like format for frontend compatibility
        childMap.set(user.email, {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          parent: req.user.id,
          status: 'online', // default status
          fromUserModel: true
        });
      }
    });

    const children = Array.from(childMap.values());
    console.log(`   Returning ${children.length} total children`);

    res.status(200).json(children);
  } catch (err) {
    console.error('❌ Error fetching children:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get a specific child by ID
exports.getChildById = async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId);

    if (!child) return res.status(404).json({ message: "Child not found" });
    if (child.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(child);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update child info
exports.updateChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const { name, age, deviceModel, osVersion, trustMode, privacyMode, dailyScreenTimeLimit } = req.body;

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ message: "Child not found" });
    if (child.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (name) child.name = name;
    if (age !== undefined) child.age = age;
    if (deviceModel) child.deviceModel = deviceModel;
    if (osVersion) child.osVersion = osVersion;
    if (trustMode !== undefined) child.trustMode = trustMode;
    if (privacyMode !== undefined) child.privacyMode = privacyMode;
    if (dailyScreenTimeLimit !== undefined) child.dailyScreenTimeLimit = dailyScreenTimeLimit;

    await child.save();

    // Send notification to child about rule changes
    if (trustMode !== undefined || privacyMode !== undefined) {
      const notif = new Notification({
        child: childId,
        parent: req.user.id,
        type: "rule_update",
        message: `Parent updated your rules and settings`,
        read: false
      });
      await notif.save();
    }

    res.status(200).json({ message: "Child updated successfully", child });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete child
exports.deleteChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId);

    if (!child) return res.status(404).json({ message: "Child not found" });
    if (child.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Child.findByIdAndDelete(childId);
    res.status(200).json({ message: "Child deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update app categories for a child
exports.updateAppCategories = async (req, res) => {
  try {
    const { childId } = req.params;
    const { educational, entertainment, social, games, communication } = req.body;

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ message: "Child not found" });
    if (child.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (educational !== undefined) child.appCategories.educational = educational;
    if (entertainment !== undefined) child.appCategories.entertainment = entertainment;
    if (social !== undefined) child.appCategories.social = social;
    if (games !== undefined) child.appCategories.games = games;
    if (communication !== undefined) child.appCategories.communication = communication;

    await child.save();

    // Send notification about category change
    const notif = new Notification({
      child: childId,
      parent: req.user.id,
      type: "category_update",
      message: `Parent updated app category restrictions`,
      read: false
    });
    await notif.save();

    res.status(200).json({ message: "App categories updated", child });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
