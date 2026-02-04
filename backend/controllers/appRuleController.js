const Notification = require("../models/Notification");
const Child = require("../models/Child");
const User = require("../models/User");
const AppRule = require("../models/AppRule");

// Create an app rule
exports.createAppRule = async (req, res) => {
  try {
    const { childId, child: childInBody, appName, appPackage, action, timeLimit, allowedStartTime, allowedEndTime, allowedDays } = req.body;
    const targetChildId = childId || childInBody || req.params.childId;

    if (!targetChildId) {
      return res.status(400).json({ message: "Child ID is required" });
    }

    // Map frontend data to back-end schema
    const isBlocked = action === 'BLOCK';
    const allowedTimeSlots = allowedDays ? allowedDays.map(day => ({
      day,
      startTime: allowedStartTime || "09:00",
      endTime: allowedEndTime || "21:00"
    })) : [];

    const appRule = new AppRule({
      child: targetChildId,
      parent: req.user.id,
      appName,
      appPackage,
      appCategory: "other", // Default category
      isBlocked,
      timeLimit: isBlocked ? null : timeLimit,
      allowedTimeSlots
    });

    await appRule.save();

    // Resolve the actual child user if needed for notifications
    const childRecord = await Child.findById(targetChildId) || await User.findById(targetChildId);
    let notificationTargetId = targetChildId;

    if (childRecord) {
      // If child has an email, find their User record to send notification
      const childUser = await User.findOne({ email: childRecord.email });
      if (childUser) notificationTargetId = childUser._id;
    }

    // Send notification to child
    const notif = new Notification({
      senderId: req.user.id,
      receiverId: notificationTargetId,
      type: "app_rule",
      message: `Parent added new app rule for ${appName}`,
      isRead: false
    });
    await notif.save();

    res.status(201).json({ message: "App rule created", appRule });
  } catch (err) {
    console.error('Error creating app rule:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all app rules for a child
exports.getAppRules = async (req, res) => {
  try {
    const { childId } = req.params;
    const rules = await AppRule.find({ child: childId, parent: req.user.id });
    res.status(200).json(rules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update an app rule
exports.updateAppRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const { appName, appPackage, action, isBlocked: isBlockedDirect, timeLimit, allowedTimeSlots, allowedDays, allowedStartTime, allowedEndTime } = req.body;

    const rule = await AppRule.findById(ruleId);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    if (rule.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Map action to isBlocked if provided
    let isBlocked = isBlockedDirect;
    if (action !== undefined) {
      isBlocked = action === 'BLOCK';
    }

    if (appName !== undefined) rule.appName = appName;
    if (appPackage !== undefined) rule.appPackage = appPackage;
    if (isBlocked !== undefined) rule.isBlocked = isBlocked;
    if (timeLimit !== undefined) rule.timeLimit = isBlocked ? null : timeLimit;

    if (allowedTimeSlots !== undefined) {
      rule.allowedTimeSlots = allowedTimeSlots;
    } else if (allowedDays) {
      rule.allowedTimeSlots = allowedDays.map(day => ({
        day,
        startTime: allowedStartTime || "09:00",
        endTime: allowedEndTime || "21:00"
      }));
    }

    rule.updatedAt = new Date();
    await rule.save();

    // Resolve the actual User ID for the child to ensure notification delivery
    const childRecord = await Child.findById(rule.child);
    let notificationTargetId = rule.child;
    if (childRecord) {
      const childUser = await User.findOne({ email: childRecord.email });
      if (childUser) notificationTargetId = childUser._id;
    }

    // Send notification to child
    const notif = new Notification({
      senderId: req.user.id,
      receiverId: notificationTargetId,
      type: "rule_update",
      message: `Parent updated ${appName} rule`,
      isRead: false
    });
    await notif.save();

    res.status(200).json({ message: "App rule updated", rule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete an app rule
exports.deleteAppRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const rule = await AppRule.findById(ruleId);

    if (!rule) return res.status(404).json({ message: "Rule not found" });
    if (rule.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await AppRule.findByIdAndDelete(ruleId);
    res.status(200).json({ message: "App rule deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
