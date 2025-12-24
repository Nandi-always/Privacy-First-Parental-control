const mongoose = require("mongoose");

const AppDownloadAlertSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appName: { type: String, required: true },
  appPackage: { type: String },
  appCategory: { type: String },
  downloadTime: { type: Date, default: Date.now },
  parentNotified: { type: Boolean, default: false },
  action: { type: String, enum: ["allow", "block"], default: null }
});

module.exports = mongoose.model("AppDownloadAlert", AppDownloadAlertSchema);
