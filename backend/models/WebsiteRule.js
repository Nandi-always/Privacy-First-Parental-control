const mongoose = require("mongoose");

const WebsiteRuleSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  website: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ["social_media", "adult_content", "gaming", "shopping", "streaming", "educational", "news", "other"],
    default: "other"
  },
  blockReason: { type: String, default: "Blocked by parent" },
  allowedTimeSlots: [{
    day: String, // "Monday", "Tuesday", etc.
    startTime: String, // "09:00"
    endTime: String // "17:00"
  }],
  attemptCount: { type: Number, default: 0 }, // Track blocked access attempts
  lastAttempt: { type: Date },
  safeSearchEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WebsiteRule", WebsiteRuleSchema);
