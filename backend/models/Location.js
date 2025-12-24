const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String },
  accuracy: { type: Number },
  timestamp: { type: Date, default: Date.now },
  isLive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Location", LocationSchema);
