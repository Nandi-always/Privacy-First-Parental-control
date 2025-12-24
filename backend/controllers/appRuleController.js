const AppRule = require("../models/AppRule");
const Notification = require("../models/Notification");

// Create an app rule
exports.createAppRule = async (req, res) => {
  try {
    const { childId } = req.params;
    const { appName, appCategory, isBlocked, timeLimit, allowedTimeSlots } = req.body;

    const appRule = new AppRule({
      child: childId,
      parent: req.user.id,
      appName,
      appCategory,
      isBlocked,
      timeLimit,
      allowedTimeSlots
    });

    await appRule.save();

    // Send notification to child
    const notif = new Notification({
      child: childId,
      parent: req.user.id,
      type: "app_rule",
      message: `Parent added new app rule for ${appName}`,
      read: false
    });
    await notif.save();

    res.status(201).json({ message: "App rule created", appRule });
  } catch (err) {
    console.error(err);
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
    const { appName, appCategory, isBlocked, timeLimit, allowedTimeSlots } = req.body;

    const rule = await AppRule.findById(ruleId);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    if (rule.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (appName !== undefined) rule.appName = appName;
    if (appCategory !== undefined) rule.appCategory = appCategory;
    if (isBlocked !== undefined) rule.isBlocked = isBlocked;
    if (timeLimit !== undefined) rule.timeLimit = timeLimit;
    if (allowedTimeSlots !== undefined) rule.allowedTimeSlots = allowedTimeSlots;
    rule.updatedAt = new Date();

    await rule.save();

    // Notify child about rule change
    const notif = new Notification({
      child: rule.child,
      parent: req.user.id,
      type: "rule_update",
      message: `Parent updated ${appName} rule`,
      read: false
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
