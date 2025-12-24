const ScreenTime = require("../models/ScreenTime");
const Notification = require("../models/Notification");

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

    // Notify child
    const notif = new Notification({
      child: childId,
      parent: req.user.id,
      type: "internet_pause",
      message: isPaused ? "Your internet access has been paused" : "Your internet access has been resumed",
      read: false
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

    const notif = new Notification({
      child: childId,
      parent: req.user.id,
      type: "limit_update",
      message: `Parent set daily screen time limit to ${limit} minutes`,
      read: false
    });
    await notif.save();

    res.status(200).json({ message: "Daily limit updated", limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
