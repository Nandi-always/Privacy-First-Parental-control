const mongoose = require("mongoose");

const ScreenTimeSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  totalTime: { type: Number, default: 0 }, // minutes
  isPaused: { type: Boolean, default: false },
  pausedAt: { type: Date },
  appUsage: [
    {
      appName: String,
      timeSpent: Number, // minutes
      category: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ScreenTime", ScreenTimeSchema);
