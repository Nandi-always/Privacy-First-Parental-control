const mongoose = require("mongoose");

const EmergencyAlertSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  message: { type: String, default: "Emergency SOS Alert" },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  parentAcknowledged: { type: Boolean, default: false }
});

module.exports = mongoose.model("EmergencyAlert", EmergencyAlertSchema);
