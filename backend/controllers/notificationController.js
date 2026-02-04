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

// Delete Notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        console.log('🗑️ Deleting notification:', { id, userId });

        // Security check: ensure notification belongs to the user
        const notification = await Notification.findOne({
            _id: id,
            receiverId: userId
        });

        if (!notification) {
            console.error('❌ Notification not found or unauthorized');
            return res.status(404).json({ message: "Notification not found" });
        }

        await Notification.findByIdAndDelete(id);
        console.log('✅ Notification deleted successfully');
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (err) {
        console.error('❌ Error deleting notification:', err.message);
        res.status(500).json({ message: "Server error" });
    }
};
