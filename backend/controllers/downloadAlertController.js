const AppRule = require("../models/AppRule");
const Child = require("../models/Child");
const User = require("../models/User");

// Log app download
exports.logAppDownload = async (req, res) => {
  try {
    const { childId } = req.params;
    const { appName, appPackage, appCategory } = req.body;

    const alert = new AppDownloadAlert({
      child: childId,
      parent: req.user.id,
      appName,
      appPackage,
      appCategory
    });

    await alert.save();

    // Check if app should be blocked based on category rules
    const child = await require("../models/Child").findById(childId);
    if (child && appCategory && child.appCategories[appCategory] === false) {
      alert.action = "block";
      await alert.save();
    }

    // We must find the actual parent of this child
    const childRec = await Child.findById(childId) || await User.findById(childId);
    if (!childRec) return res.status(404).json({ message: "Child not found" });
    const parentId = childRec.parent || childRec.parentId;
    if (!parentId) return res.status(404).json({ message: "Parent not found for this child" });

    // Update alert parent
    alert.parent = parentId;
    await alert.save();

    // Send notification to parent
    const notif = new Notification({
      senderId: childId,
      receiverId: parentId,
      type: "app_download",
      message: `New app downloaded: ${appName}`,
      isRead: false
    });
    await notif.save();

    res.status(201).json({ message: "App download logged", alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get download alerts
exports.getDownloadAlerts = async (req, res) => {
  try {
    const { childId } = req.params;
    const { status = "all" } = req.query; // all, pending, allowed, blocked

    let query = { child: childId, parent: req.user.id };
    if (status === "pending") query.action = null;
    if (status === "allowed") query.action = "allow";
    if (status === "blocked") query.action = "block";

    const alerts = await AppDownloadAlert.find(query).sort({ downloadTime: -1 });
    res.status(200).json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Approve/Block app download
exports.approveOrBlockApp = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { action } = req.body; // "allow" or "block"

    const alert = await AppDownloadAlert.findById(alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.action = action;
    alert.parentNotified = true;
    await alert.save();

    res.status(200).json({ message: `App ${action === "allow" ? "approved" : "blocked"}`, alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
