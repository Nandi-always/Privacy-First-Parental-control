const RiskyActivityAlert = require("../models/RiskyActivityAlert");
const ScreenTime = require("../models/ScreenTime");
const WebsiteRule = require("../models/WebsiteRule");
const Location = require("../models/Location");
const AppDownloadAlert = require("../models/AppDownloadAlert");
const Child = require("../models/Child");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Detect risky activity (called by cron job or manually)
exports.detectRiskyActivity = async (req, res) => {
    try {
        const { childId } = req.params;
        console.log(`🔍 Running risky activity detection for child: ${childId}`);

        let childDoc = await Child.findById(childId);
        if (!childDoc) {
            childDoc = await User.findById(childId);
        }

        if (!childDoc) {
            console.error(`❌ Risky Detection: Child not found: ${childId}`);
            return res.status(404).json({ message: "Child not found" });
        }

        // Safely extract parentId
        const childData = childDoc.toObject();
        const parentId = childData.parent || childData.parentId;

        if (!parentId || typeof parentId === 'function') {
            console.error(`❌ Risky Detection: No parent linked for child ${childId}`);
            return res.status(400).json({ message: "No parent linked to this account" });
        }

        const today = new Date().toDateString();
        const alerts = [];

        // 1. Check for excessive screen time (>6 hours)
        const screenTime = await ScreenTime.findOne({
            child: childId,
            date: today
        });

        if (screenTime && screenTime.totalTime > 360) {
            const alert = new RiskyActivityAlert({
                child: childId,
                parent: parentId,
                alertType: "excessive_screen_time",
                severity: "high",
                description: `Child has used ${Math.floor(screenTime.totalTime / 60)} hours of screen time today`,
                metadata: { totalTime: screenTime.totalTime, limit: childData.dailyScreenTimeLimit }
            });
            await alert.save();
            alerts.push(alert);
        }

        // 2. Check for late-night usage (12 AM - 5 AM)
        if (screenTime) {
            const now = new Date();
            const currentHour = now.getHours();
            if (currentHour >= 0 && currentHour < 5) {
                const alert = new RiskyActivityAlert({
                    child: childId,
                    parent: parentId,
                    alertType: "late_night_usage",
                    severity: "medium",
                    description: `Child is using device at ${now.toLocaleTimeString()}`,
                    metadata: { time: now.toISOString() }
                });
                await alert.save();
                alerts.push(alert);
            }
        }

        // 3. Check for excessive blocked site attempts (>5 per day)
        const blockedAttempts = await WebsiteRule.find({
            child: childId,
            attemptCount: { $gt: 0 }
        });

        const totalAttempts = blockedAttempts.reduce((sum, rule) => sum + rule.attemptCount, 0);
        if (totalAttempts > 5) {
            const alert = new RiskyActivityAlert({
                child: childId,
                parent: parentId,
                alertType: "blocked_site_attempts",
                severity: "medium",
                description: `Child attempted to access blocked websites ${totalAttempts} times today`,
                metadata: { totalAttempts, sites: blockedAttempts.map(r => r.website) }
            });
            await alert.save();
            alerts.push(alert);
        }

        // 4. Check for unauthorized app installations
        const recentDownloads = await AppDownloadAlert.find({
            child: childId,
            downloadTime: { $gte: new Date(today) },
            action: null
        });

        if (recentDownloads.length > 0) {
            const alert = new RiskyActivityAlert({
                child: childId,
                parent: parentId,
                alertType: "unauthorized_app",
                severity: "high",
                description: `${recentDownloads.length} new app(s) installed without approval`,
                metadata: { apps: recentDownloads.map(d => d.appName) }
            });
            await alert.save();
            alerts.push(alert);
        }

        // Send notifications for new alerts
        for (const alert of alerts) {
            try {
                const notif = new Notification({
                    senderId: childId,
                    receiverId: parentId,
                    type: "risky_activity",
                    message: `⚠️ ${alert.description}`,
                    isRead: false
                });
                await notif.save();
            } catch (notifErr) {
                console.warn('   Notification failed:', notifErr.message);
            }
        }

        console.log(`✅ Risky Detection complete: ${alerts.length} alerts generated.`);
        res.status(200).json({
            message: `Detected ${alerts.length} risky activities`,
            alerts
        });
    } catch (err) {
        console.error(`❌ Risky Detection Error:`, err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get risky activities for a child
exports.getRiskyActivities = async (req, res) => {
    try {
        const { childId } = req.params;
        const { acknowledged, severity, alertType } = req.query;

        const query = { child: childId, parent: req.user.id };

        if (acknowledged !== undefined) {
            query.isAcknowledged = acknowledged === 'true';
        }
        if (severity) {
            query.severity = severity;
        }
        if (alertType) {
            query.alertType = alertType;
        }

        const alerts = await RiskyActivityAlert.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Acknowledge an alert
exports.acknowledgeAlert = async (req, res) => {
    try {
        const { alertId } = req.params;

        const alert = await RiskyActivityAlert.findById(alertId);
        if (!alert) return res.status(404).json({ message: "Alert not found" });
        if (alert.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        alert.isAcknowledged = true;
        alert.acknowledgedAt = new Date();
        await alert.save();

        res.status(200).json({ message: "Alert acknowledged", alert });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get alert statistics
exports.getAlertStats = async (req, res) => {
    try {
        const { childId } = req.params;
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const alerts = await RiskyActivityAlert.find({
            child: childId,
            parent: req.user.id,
            createdAt: { $gte: startDate }
        });

        // Group by alert type
        const byType = {};
        const bySeverity = { low: 0, medium: 0, high: 0 };

        alerts.forEach(alert => {
            byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
            bySeverity[alert.severity] += 1;
        });

        res.status(200).json({
            period: `last ${days} days`,
            totalAlerts: alerts.length,
            unacknowledged: alerts.filter(a => !a.isAcknowledged).length,
            byType,
            bySeverity,
            recentAlerts: alerts.slice(0, 5)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
