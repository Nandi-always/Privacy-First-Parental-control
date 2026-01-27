const mongoose = require("mongoose");

const RiskyActivityAlertSchema = new mongoose.Schema({
    child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    alertType: {
        type: String,
        enum: [
            "excessive_screen_time",
            "late_night_usage",
            "blocked_site_attempts",
            "unauthorized_app",
            "unusual_location",
            "rapid_app_switching",
            "geofence_violation"
        ],
        required: true
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // Additional context
    isAcknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RiskyActivityAlert", RiskyActivityAlertSchema);
