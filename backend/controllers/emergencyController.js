const EmergencyAlert = require("../models/EmergencyAlert");
const Location = require("../models/Location");
const Notification = require("../models/Notification");

// Send SOS emergency alert
exports.sendEmergencyAlert = async (req, res) => {
  try {
    const { childId } = req.params;
    const { latitude, longitude, message } = req.body;

    const alert = new EmergencyAlert({
      child: childId,
      parent: req.user.id,
      latitude,
      longitude,
      message: message || "Emergency SOS Alert"
    });

    await alert.save();

    // Send urgent notification to parent
    const notif = new Notification({
      child: childId,
      parent: req.user.id,
      type: "emergency",
      message: "EMERGENCY: Your child sent an SOS alert!",
      read: false,
      urgent: true
    });
    await notif.save();

    res.status(201).json({ message: "Emergency alert sent to parent", alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get emergency alerts
exports.getEmergencyAlerts = async (req, res) => {
  try {
    const { childId } = req.params;
    const alerts = await EmergencyAlert.find({
      child: childId,
      parent: req.user.id
    }).sort({ timestamp: -1 });

    res.status(200).json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Acknowledge emergency alert
exports.acknowledgeEmergency = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await EmergencyAlert.findById(alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.parentAcknowledged = true;
    alert.resolved = true;
    await alert.save();

    res.status(200).json({ message: "Alert acknowledged", alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
