const AppApprovalRequest = require("../models/AppApprovalRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Child = require("../models/Child");
const AppRule = require("../models/AppRule");

// Child requests app approval
exports.requestAppApproval = async (req, res) => {
    try {
        const { childId } = req.params;
        const { appName, appPackage, appCategory, requestReason } = req.body;

        // Check if request already exists
        const existingRequest = await AppApprovalRequest.findOne({
            child: childId,
            appName,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Request already pending for this app" });
        }

        // Get parent ID
        const child = await Child.findById(childId);
        if (!child) return res.status(404).json({ message: "Child not found" });

        const approvalRequest = new AppApprovalRequest({
            child: childId,
            parent: child.parent,
            appName,
            appPackage,
            appCategory: appCategory || "other",
            requestReason: requestReason || ""
        });

        await approvalRequest.save();

        // Notify parent
        const notif = new Notification({
            senderId: childId,
            receiverId: child.parent,
            type: "app_approval_request",
            message: `${child.name} requests approval for app: ${appName}`,
            isRead: false
        });
        await notif.save();

        res.status(201).json({
            message: "App approval request sent to parent",
            request: approvalRequest
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Parent gets all approval requests
exports.getApprovalRequests = async (req, res) => {
    try {
        const { status } = req.query; // pending, approved, denied, or all

        const query = { parent: req.user.id };
        if (status && status !== "all") {
            query.status = status;
        }

        const requests = await AppApprovalRequest.find(query)
            .populate("child", "name email age")
            .sort({ requestedAt: -1 });

        res.status(200).json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Parent approves app request
exports.approveRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { parentResponse } = req.body;

        const request = await AppApprovalRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        request.status = "approved";
        request.parentResponse = parentResponse || "Approved";
        request.respondedAt = new Date();
        await request.save();

        // Create app rule to allow the app
        const appRule = new AppRule({
            child: request.child,
            parent: req.user.id,
            appName: request.appName,
            appCategory: request.appCategory,
            isBlocked: false
        });
        await appRule.save();

        // Notify child
        const child = await Child.findById(request.child);
        if (child) {
            const childUser = await User.findOne({ email: child.email });
            if (childUser) {
                const notif = new Notification({
                    senderId: req.user.id,
                    receiverId: childUser._id,
                    type: "app_approval_response",
                    message: `Your request for ${request.appName} was approved! ${parentResponse || ''}`,
                    isRead: false
                });
                await notif.save();
            }
        }

        res.status(200).json({ message: "App request approved", request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Parent denies app request
exports.denyRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { parentResponse } = req.body;

        const request = await AppApprovalRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        request.status = "denied";
        request.parentResponse = parentResponse || "Denied";
        request.respondedAt = new Date();
        await request.save();

        // Create app rule to block the app
        const appRule = new AppRule({
            child: request.child,
            parent: req.user.id,
            appName: request.appName,
            appCategory: request.appCategory,
            isBlocked: true
        });
        await appRule.save();

        // Notify child
        const child = await Child.findById(request.child);
        if (child) {
            const childUser = await User.findOne({ email: child.email });
            if (childUser) {
                const notif = new Notification({
                    senderId: req.user.id,
                    receiverId: childUser._id,
                    type: "app_approval_response",
                    message: `Your request for ${request.appName} was denied. ${parentResponse || ''}`,
                    isRead: false
                });
                await notif.save();
            }
        }

        res.status(200).json({ message: "App request denied", request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Child gets their own requests
exports.getChildRequests = async (req, res) => {
    try {
        const { childId } = req.params;

        const requests = await AppApprovalRequest.find({ child: childId })
            .sort({ requestedAt: -1 });

        res.status(200).json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
