const mongoose = require("mongoose");

const ChildSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  age: { type: Number },
  deviceId: { type: String },
  deviceModel: { type: String },
  osVersion: { type: String },
  role: { type: String, enum: ["child"], default: "child" },
  trustMode: { type: Boolean, default: false },
  privacyMode: { type: Boolean, default: false },
  dailyScreenTimeLimit: { type: Number, default: 480 }, // minutes
  appCategories: {
    educational: { type: Boolean, default: true, unrestricted: true },
    entertainment: { type: Boolean, default: true, timeLimit: 120 }, // minutes
    social: { type: Boolean, default: false, timeLimit: 60 },
    games: { type: Boolean, default: true, timeLimit: 90 },
  },
  // Screen Time Settings
  warningThreshold: { type: Number, default: 30 },
  enforceBedtime: { type: Boolean, default: true },
  bedtimeStart: { type: String, default: "22:00" },
  bedtimeEnd: { type: String, default: "06:00" },
  schoolHours: { type: Boolean, default: true },
  schoolStart: { type: String, default: "08:00" },
  schoolEnd: { type: String, default: "15:00" },
  allowBreak: { type: Boolean, default: false },
  breakDuration: { type: Number, default: 5 },
  breakInterval: { type: Number, default: 30 },
  geofences: [{
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    radius: { type: Number, default: 200 }, // meters
    startTime: { type: String }, // e.g., "08:00"
    endTime: { type: String },   // e.g., "15:00"
    days: [{ type: String }],    // e.g., ["Monday", "Tuesday"]
    lastStatus: { type: String, enum: ["inside", "outside", "unknown"], default: "unknown" },
    enabled: { type: Boolean, default: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Child", ChildSchema);
