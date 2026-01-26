const Notification = require("../models/Notification");
const Child = require("../models/Child");
const User = require("../models/User");

// Log app usage
exports.logAppUsage = async (req, res) => {
  try {
    const { childId } = req.params;
    const { appName, timeSpent, category, date } = req.body;

    let screenTime = await ScreenTime.findOne({
      child: childId,
      date: new Date(date).toDateString()
    });

    if (!screenTime) {
      screenTime = new ScreenTime({
        child: childId,
        parent: req.user.id,
        date: new Date(date),
        appUsage: []
      });
    }

    const existingApp = screenTime.appUsage.find(app => app.appName === appName);
    if (existingApp) {
      existingApp.timeSpent += timeSpent;
    } else {
      screenTime.appUsage.push({ appName, timeSpent, category });
    }

    screenTime.totalTime += timeSpent;
    await screenTime.save();

    res.status(200).json({ message: "App usage logged", screenTime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get daily screen time for a child
exports.getDailyScreenTime = async (req, res) => {
  try {
    const { childId } = req.params;
    const { date } = req.query;

    const screenTime = await ScreenTime.findOne({
      child: childId,
      parent: req.user.id,
      date: new Date(date || new Date()).toDateString()
    });

    res.status(200).json(screenTime || { totalTime: 0, appUsage: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get screen time history (7 days or custom range)
exports.getScreenTimeHistory = async (req, res) => {
  try {
    const { childId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await ScreenTime.find({
      child: childId,
      parent: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Pause internet access for a child
exports.pauseInternetAccess = async (req, res) => {
  try {
    const { childId } = req.params;
    const { isPaused } = req.body;

    const today = new Date().toDateString();
    let screenTime = await ScreenTime.findOne({
      child: childId,
      date: today
    });

    if (!screenTime) {
      screenTime = new ScreenTime({
        child: childId,
        parent: req.user.id,
        date: new Date(today),
        isPaused
      });
    } else {
      screenTime.isPaused = isPaused;
      screenTime.pausedAt = new Date();
    }

    await screenTime.save();

    // We must find the actual parent of this child
    const child = await Child.findById(childId) || await User.findById(childId);
    if (!child) return res.status(404).json({ message: "Child not found" });
    const parentId = child.parent || child.parentId;

    // Notify child
    const notif = new Notification({
      senderId: req.user.id,
      receiverId: childId,
      type: "internet_pause",
      message: isPaused ? "Your internet access has been paused" : "Your internet access has been resumed",
      isRead: false
    });
    await notif.save();

    res.status(200).json({ message: `Internet access ${isPaused ? "paused" : "resumed"}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Set daily screen time limit
exports.setDailyLimit = async (req, res) => {
  try {
    const { childId } = req.params;
    const { limit } = req.body; // in minutes

    const child = await require("../models/Child").findById(childId);
    if (!child) return res.status(404).json({ message: "Child not found" });

    child.dailyScreenTimeLimit = limit;
    await child.save();

    // Resolve the actual User ID for the child to ensure notification delivery
    const childUser = await User.findOne({ email: child.email });
    const notificationTargetId = childUser ? childUser._id : childId;

    const notif = new Notification({
      senderId: req.user.id,
      receiverId: notificationTargetId,
      type: "limit_update",
      message: `Parent set daily screen time limit to ${limit} minutes`,
      isRead: false
    });
    await notif.save();

    res.status(200).json({ message: "Daily limit updated", limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all screen time settings for a child
exports.getScreenTimeSettings = async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId);

    if (!child) return res.status(404).json({ message: "Child not found" });
    if (child.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const settings = {
      dailyLimit: child.dailyScreenTimeLimit,
      warningThreshold: child.warningThreshold,
      enforceBedtime: child.enforceBedtime,
      bedtimeStart: child.bedtimeStart,
      bedtimeEnd: child.bedtimeEnd,
      schoolHours: child.schoolHours,
      schoolStart: child.schoolStart,
      schoolEnd: child.schoolEnd,
      allowBreak: child.allowBreak,
      breakDuration: child.breakDuration,
      breakInterval: child.breakInterval
    };

    res.status(200).json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update all screen time settings for a child
exports.updateScreenTimeSettings = async (req, res) => {
  try {
    const { childId } = req.params;
    const settings = req.body;

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ message: "Child not found" });
    if (child.parent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update fields if they are provided in the request body
    if (settings.dailyLimit !== undefined) child.dailyScreenTimeLimit = settings.dailyLimit;
    if (settings.warningThreshold !== undefined) child.warningThreshold = settings.warningThreshold;
    if (settings.enforceBedtime !== undefined) child.enforceBedtime = settings.enforceBedtime;
    if (settings.bedtimeStart !== undefined) child.bedtimeStart = settings.bedtimeStart;
    if (settings.bedtimeEnd !== undefined) child.bedtimeEnd = settings.bedtimeEnd;
    if (settings.schoolHours !== undefined) child.schoolHours = settings.schoolHours;
    if (settings.schoolStart !== undefined) child.schoolStart = settings.schoolStart;
    if (settings.schoolEnd !== undefined) child.schoolEnd = settings.schoolEnd;
    if (settings.allowBreak !== undefined) child.allowBreak = settings.allowBreak;
    if (settings.breakDuration !== undefined) child.breakDuration = settings.breakDuration;
    if (settings.breakInterval !== undefined) child.breakInterval = settings.breakInterval;

    await child.save();

    await child.save();

    // Resolve the actual User ID for the child to ensure notification delivery
    const childUser = await User.findOne({ email: child.email });
    const notificationTargetId = childUser ? childUser._id : childId;

    // Notify child about settings update
    const notif = new Notification({
      senderId: req.user.id,
      receiverId: notificationTargetId,
      type: "rule_update",
      message: "Your screen time settings have been updated by your parent",
      isRead: false
    });
    await notif.save();

    res.status(200).json({ message: "Screen time settings updated successfully", settings: child });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
