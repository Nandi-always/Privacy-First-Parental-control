const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
        type: String,
        enum: ["screen_time_warning", "screen_time_exceeded", "app_blocked", "website_blocked", "bedtime", "app_installed", "rule_violation", "location_alert", "custom"],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
        type: String,
        enum: ["info", "warning", "critical"],
        default: "info"
    },
    isRead: { type: Boolean, default: false },
    isAcknowledged: { type: Boolean, default: false },
    metadata: {
        appName: String,
        website: String,
        timeRemaining: Number,
        location: String,
        ruleId: mongoose.Schema.Types.ObjectId
    },
    createdAt: { type: Date, default: Date.now },
    acknowledgedAt: { type: Date }
});

// Index for faster queries
AlertSchema.index({ userId: 1, createdAt: -1 });
AlertSchema.index({ childId: 1, createdAt: -1 });

module.exports = mongoose.model("Alert", AlertSchema);
