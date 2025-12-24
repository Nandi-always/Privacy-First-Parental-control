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
    communication: { type: Boolean, default: true, timeLimit: null }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Child", ChildSchema);
