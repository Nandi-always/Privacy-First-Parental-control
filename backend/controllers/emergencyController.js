const EmergencyAlert = require("../models/EmergencyAlert");
const Location = require("../models/Location");
const Notification = require("../models/Notification");
const Child = require("../models/Child");
const User = require("../models/User");

// Send SOS emergency alert
// Send SOS emergency alert
exports.sendEmergencyAlert = async (req, res) => {
  try {
    const { childId } = req.params;
    const { latitude, longitude, message } = req.body;

    // Safety check for req.user
    if (!req.user || !req.user.id) {
      console.error('❌ SOS Failure: No authenticated user found in request');
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

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
    try {
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
        if (childUser) {
          if (childUser.role === 'child') {
            parentId = childUser.parentId;
            childName = childUser.name;
            console.log(`✅ Found parent in User record: ${parentId}`);
          } else {
            console.warn(`⚠️ ID ${effectiveChildId} belongs to a PARENT account, not a child. Self-alerting?`);
            // Optional: Allow parents to test SOS? For now, fail or let them alert themselves if desired.
            // Let's assume testing: set parentId to themselves or handle gracefully/
            parentId = childUser._id; // Self-alert for testing
          }
        }
      }
    } catch (lookupErr) {
      console.error('❌ Error during DB lookup for child/parent:', lookupErr);
      return res.status(500).json({ message: "Database lookup failed", error: lookupErr.message });
    }

    if (!parentId) {
      console.error(`❌ SOS Failure: No parent found for childId ${effectiveChildId}`);
      return res.status(404).json({ message: "Unable to identify your parent to send alert. Please check account linkage." });
    }

    console.log(`💾 Saving EmergencyAlert for child=${effectiveChildId}, parent=${parentId}`);

    try {
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
    } catch (saveErr) {
      console.error('❌ Error saving alert or notification:', saveErr);
      return res.status(500).json({ message: "Failed to save emergency alert", error: saveErr.message });
    }

  } catch (err) {
    console.error('❌ SOS Error CRASH (Top Level):', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get emergency alerts
exports.getEmergencyAlerts = async (req, res) => {
  try {
    const { childId } = req.params;

    let query = { child: childId };

    // If requester is parent, filter by parent ID
    if (req.user.role === 'parent') {
      query.parent = req.user.id;
    }
    // If requester is child, ensure they match the childId
    else {
      // Basic authorization check
      if (req.user.id !== childId) {
        // Fallback: checks if the token belongs to the child requested
        // console.warn(`Mismatch in child alert request: token=${req.user.id}, param=${childId}`);
      }
      // For children, we just want alerts where they are the child
      // The { child: childId } query already handles this, assuming childId is correct.
      // Ideally we enforce req.user.id === childId, but for robustness we'll trust the token ID primarily if we wanted strictness.
      // But adhering to the requested param with a query filter is safe enough if we assume the route is properly guarded or we just trust the query.
      // Actually, let's be strict:
      if (req.user.role === 'child' && req.user.id !== childId) {
        return res.status(403).json({ message: "Unauthorized access to alerts" });
      }
    }

    const alerts = await EmergencyAlert.find(query).sort({ timestamp: -1 });

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

// Update real-time location during emergency
exports.updateEmergencyLocation = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { latitude, longitude, accuracy } = req.body;

    const alert = await EmergencyAlert.findById(alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    if (!alert.isTrackingActive) {
      return res.status(400).json({ message: "Tracking is not active for this alert" });
    }

    alert.locationUpdates.push({
      latitude,
      longitude,
      accuracy: accuracy || 10,
      timestamp: new Date()
    });

    // Update main coordinates to latest
    alert.latitude = latitude;
    alert.longitude = longitude;

    await alert.save();

    res.status(200).json({ message: "Location updated", alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Parent marks they called the child
exports.markParentCalled = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await EmergencyAlert.findById(alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.parentCalledAt = new Date();
    await alert.save();

    res.status(200).json({ message: "Call logged", alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Child or parent marks situation as safe
exports.markSafe = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { markedBy, incidentType, incidentNotes } = req.body;

    const alert = await EmergencyAlert.findById(alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.resolved = true;
    alert.markedSafeAt = new Date();
    alert.markedSafeBy = markedBy || 'child';
    alert.isTrackingActive = false;
    alert.safetyModeActive = false;
    alert.incidentType = incidentType || 'resolved_safely';
    alert.incidentNotes = incidentNotes || '';

    await alert.save();

    // Send notification to other party
    const Notification = require("../models/Notification");
    const notifReceiver = markedBy === 'child' ? alert.parent : alert.child;
    const notifSender = markedBy === 'child' ? alert.child : alert.parent;

    const notif = new Notification({
      senderId: notifSender,
      receiverId: notifReceiver,
      type: "emergency_resolved",
      message: `Emergency situation marked as safe by ${markedBy}`,
      isRead: false
    });
    await notif.save();

    res.status(200).json({ message: "Marked as safe", alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
