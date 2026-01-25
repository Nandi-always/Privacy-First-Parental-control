const EmergencyAlert = require("../models/EmergencyAlert");
const Location = require("../models/Location");
const Notification = require("../models/Notification");
const Child = require("../models/Child");
const User = require("../models/User");

// Send SOS emergency alert
exports.sendEmergencyAlert = async (req, res) => {
  try {
    const { childId } = req.params;
    const { latitude, longitude, message } = req.body;
    const authenticatedId = req.user.id;

    console.log(`📡 Processing SOS Request: pathId=${childId}, authId=${authenticatedId}`);

    // Use authId as the definitive sender
    const effectiveChildId = authenticatedId || childId;

    if (!effectiveChildId) {
      console.error('❌ SOS Failure: No child ID identified');
      return res.status(400).json({ message: "Child identification missing" });
    }

    let parentId = null;
    let childName = "Child";

    // 1. Try to find the child in the Child monitoring collection
    console.log(`🔍 Searching Child collection for ${effectiveChildId}...`);
    const childRecord = await Child.findById(effectiveChildId);
    if (childRecord) {
      parentId = childRecord.parent;
      childName = childRecord.name;
      console.log(`✅ Found parent in Child record: ${parentId}`);
    } else {
      // 2. Fallback: Try to find the child in the User accounts collection
      console.log(`🔍 Fallback: Searching User collection for ${effectiveChildId}...`);
      const childUser = await User.findById(effectiveChildId);
      if (childUser && childUser.role === 'child') {
        parentId = childUser.parentId;
        childName = childUser.name;
        console.log(`✅ Found parent in User record: ${parentId}`);
      }
    }

    if (!parentId) {
      console.error(`❌ SOS Failure: No parent found for childId ${effectiveChildId}`);
      return res.status(404).json({ message: "Unable to identify your parent to send alert" });
    }

    console.log(`💾 Saving EmergencyAlert for child=${effectiveChildId}, parent=${parentId}`);
    const alert = new EmergencyAlert({
      child: effectiveChildId,
      parent: parentId,
      latitude: latitude || 0,
      longitude: longitude || 0,
      message: message || "Emergency SOS Alert"
    });

    await alert.save();

    console.log(`📧 Creating Notification: sender=${effectiveChildId}, receiver=${parentId}`);
    // Send urgent notification to parent
    const notif = new Notification({
      senderId: effectiveChildId,
      receiverId: parentId,
      type: "emergency",
      message: `EMERGENCY: Your child (${childName}) sent an SOS alert!`,
      isRead: false
    });
    await notif.save();

    console.log(`🚀 SOS Alert SUCCESS. Sent to parent ${parentId}`);
    res.status(201).json({ message: "Emergency alert sent to parent", alert });
  } catch (err) {
    console.error('❌ SOS Error CRASH:', err);
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
