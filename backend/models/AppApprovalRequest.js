const mongoose = require("mongoose");

const AppApprovalRequestSchema = new mongoose.Schema({
    child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appName: { type: String, required: true },
    appPackage: { type: String },
    appCategory: {
        type: String,
        enum: ["educational", "game", "social", "productivity", "entertainment", "communication", "other"],
        default: "other"
    },
    requestReason: { type: String, default: "" },
    status: {
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending"
    },
    parentResponse: { type: String, default: "" },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date }
});

module.exports = mongoose.model("AppApprovalRequest", AppApprovalRequestSchema);
