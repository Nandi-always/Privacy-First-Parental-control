const Alert = require("../models/Alert");

// Get all alerts for a user (parent sees all, child sees their own)
exports.getAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { childId } = req.query;

        let query = {};

        if (req.user.role === "parent") {
            // Parent can see all alerts or filter by child
            if (childId) {
                query = { childId };
            } else {
                query = { userId };
            }
        } else {
            // Child only sees their own alerts
            query = { userId };
        }

        const alerts = await Alert.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(alerts);
    } catch (err) {
        console.error("Get alerts error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Create a new alert
exports.createAlert = async (req, res) => {
    try {
        const { userId, childId, type, title, message, severity, metadata } = req.body;

        const alert = new Alert({
            userId: userId || req.user.id,
            childId,
            type,
            title,
            message,
            severity: severity || "info",
            metadata
        });

        await alert.save();

        console.log("✅ Alert created:", alert._id, type);
        res.status(201).json(alert);
    } catch (err) {
        console.error("Create alert error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Mark alert as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const alert = await Alert.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        res.status(200).json(alert);
    } catch (err) {
        console.error("Mark alert as read error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Acknowledge alert
exports.acknowledgeAlert = async (req, res) => {
    try {
        const { id } = req.params;

        const alert = await Alert.findByIdAndUpdate(
            id,
            {
                isAcknowledged: true,
                acknowledgedAt: new Date()
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        res.status(200).json(alert);
    } catch (err) {
        console.error("Acknowledge alert error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const alert = await Alert.findOne({ _id: id, userId });

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        await Alert.findByIdAndDelete(id);

        res.status(200).json({ message: "Alert deleted successfully" });
    } catch (err) {
        console.error("Delete alert error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await Alert.countDocuments({
            userId,
            isRead: false
        });

        res.status(200).json({ count });
    } catch (err) {
        console.error("Get unread count error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
