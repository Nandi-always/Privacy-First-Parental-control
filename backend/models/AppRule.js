const mongoose = require("mongoose");

const AppRuleSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appName: { type: String, required: true },
  appCategory: { type: String, enum: ["educational", "entertainment", "social", "games", "communication"], required: true },
  isBlocked: { type: Boolean, default: false },
  timeLimit: { type: Number, default: null }, // minutes
  allowedTimeSlots: [
    {
      day: String, // "Monday", "Tuesday", etc.
      startTime: String, // "09:00"
      endTime: String // "17:00"
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AppRule", AppRuleSchema);
