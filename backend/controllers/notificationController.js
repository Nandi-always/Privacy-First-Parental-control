const Notification = require("../models/Notification");
const User = require("../models/User");

// Send Notification
exports.sendNotification = async (req, res) => {
    try {
        const { receiverId, message, type } = req.body;
        const senderId = req.user.id; // From auth middleware

        console.log('📨 Sending notification:', { senderId, receiverId, message, type });

        if (!receiverId || !message) {
            console.error('❌ Missing required fields:', { receiverId, message });
            return res.status(400).json({ message: "receiverId and message are required" });
        }

        const notification = new Notification({
            senderId,
            receiverId,
            message,
            type
        });

        await notification.save();
        console.log('✅ Notification saved successfully:', notification._id);
        res.status(201).json(notification);
    } catch (err) {
        console.error('❌ Error sending notification:', err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get Notifications for User
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ receiverId: userId })
            .sort({ createdAt: -1 })
            .populate("senderId", "name role");

        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Mark as Read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
