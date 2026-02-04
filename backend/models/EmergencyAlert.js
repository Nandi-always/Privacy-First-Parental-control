const mongoose = require("mongoose");

const EmergencyAlertSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  message: { type: String, default: "Emergency SOS Alert" },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  parentAcknowledged: { type: Boolean, default: false },

  // Real-time tracking
  isTrackingActive: { type: Boolean, default: true },
  locationUpdates: [{
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now },
    accuracy: Number
  }],

  // Safety mode
  safetyModeActive: { type: Boolean, default: true },
  restrictionsBypassed: { type: Boolean, default: true }, // All parental controls bypassed during emergency

  // Parent response
  parentCalledAt: { type: Date },
  parentArrivedAt: { type: Date },

  // Resolution
  markedSafeAt: { type: Date },
  markedSafeBy: { type: String, enum: ['child', 'parent'] },
  incidentNotes: { type: String, default: '' },
  incidentType: { type: String, enum: ['false_alarm', 'resolved_safely', 'required_intervention', 'other'] }
});

module.exports = mongoose.model("EmergencyAlert", EmergencyAlertSchema);
