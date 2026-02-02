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

        console.log(`📱 App approval request from child: ${childId} for ${appName}`);

        // Check if request already exists
        const existingRequest = await AppApprovalRequest.findOne({
            child: childId,
            appName,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Request already pending for this app" });
        }

        // Get child and parent info
        let childDoc = await Child.findById(childId);
        let parentId;
        let resolvedChildId = childId;

        if (childDoc) {
            // If we found a record in Child collection, find the linked User record
            const childUser = await User.findOne({ email: childDoc.email });
            if (childUser) {
                resolvedChildId = childUser._id;
                console.log(`   Resolved Child ID to User ID: ${resolvedChildId}`);
            }
        } else {
            // Check User collection directly
            childDoc = await User.findById(childId);
        }

        if (!childDoc) {
            console.error(`❌ Child not found for ID: ${childId}`);
            return res.status(404).json({ message: "Child account not found" });
        }

        // Safely extract parent ID avoiding Mongoose method conflict
        const childData = childDoc.toObject();
        parentId = childData.parent || childData.parentId;

        // Fallback: search for any parent if not linked (for demo)
        if (!parentId || typeof parentId === 'function') {
            console.warn(`⚠️ No parent linked to child ${childId}, searching for fallback parent...`);
            const fallbackParent = await User.findOne({ role: 'parent' });
            if (fallbackParent) {
                parentId = fallbackParent._id;
                console.log(`   Using fallback parent: ${parentId}`);
            }
        }

        if (!parentId || typeof parentId === 'function') {
            console.error(`❌ Parent ID not found for child: ${childId}`);
            return res.status(400).json({ message: "Your account is not linked to any parent." });
        }

        console.log(`   Reporting request to parent: ${parentId}`);

        const approvalRequest = new AppApprovalRequest({
            child: resolvedChildId,
            parent: parentId,
            appName,
            appPackage,
            appCategory: appCategory || "other",
            requestReason: requestReason || ""
        });

        await approvalRequest.save();
        console.log(`✅ App request saved successfully`);

        // Notify parent
        try {
            const notif = new Notification({
                senderId: childId,
                receiverId: parentId,
                type: "app_approval_request",
                message: `${childDoc.name || 'Your child'} requests approval for app: ${appName}`,
                isRead: false
            });
            await notif.save();
            console.log(`🔔 Notification sent to parent: ${parentId}`);
        } catch (notifErr) {
            console.warn(`⚠️ Failed to send notification:`, notifErr.message);
        }

        res.status(201).json({
            message: "App approval request sent to parent",
            request: approvalRequest
        });
    } catch (err) {
        console.error(`❌ Critical error in requestAppApproval:`, err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Parent gets all approval requests
exports.getApprovalRequests = async (req, res) => {
    try {
        const { status, childId } = req.query; // pending, approved, denied, or all
        console.log(`🔍 Parent ${req.user.id} fetching app requests (status: ${status || 'all'}, childFilter: ${childId || 'none'})`);

        const query = { parent: req.user.id };
        if (status && status !== "all") {
            query.status = status;
        }

        // Apply child filter if provided
        if (childId) {
            const allPossibleChildIds = [childId];
            try {
                const user = await User.findById(childId);
                if (user) {
                    const child = await Child.findOne({ email: user.email });
                    if (child) allPossibleChildIds.push(child._id.toString());
                } else {
                    const child = await Child.findById(childId);
                    if (child) {
                        const user = await User.findOne({ email: child.email });
                        if (user) allPossibleChildIds.push(user._id.toString());
                    }
                }
            } catch (e) { }
            query.child = { $in: allPossibleChildIds };
            console.log(`   Applying child filter for IDs:`, allPossibleChildIds);
        }

        const requests = await AppApprovalRequest.find(query)
            .populate("child", "name email age")
            .sort({ requestedAt: -1 });

        console.log(`   Found ${requests.length} total requests for this parent`);
        res.status(200).json(requests);
    } catch (err) {
        console.error(`❌ Error in getApprovalRequests:`, err);
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
        console.log(`🔍 Fetching app requests for childId: ${childId}`);

        // Resolve all possible IDs for this child
        const allPossibleChildIds = [childId];
        try {
            const user = await User.findById(childId);
            if (user) {
                const child = await Child.findOne({ email: user.email });
                if (child) {
                    allPossibleChildIds.push(child._id.toString());
                    console.log(`   Found associated Child record: ${child._id}`);
                }
            } else {
                const child = await Child.findById(childId);
                if (child) {
                    const user = await User.findOne({ email: child.email });
                    if (user) {
                        allPossibleChildIds.push(user._id.toString());
                        console.log(`   Found associated User record: ${user._id}`);
                    }
                }
            }
        } catch (e) {
            console.log('   ID Resolution note:', e.message);
        }

        console.log(`   Searching requests for IDs:`, allPossibleChildIds);

        const requests = await AppApprovalRequest.find({
            child: { $in: allPossibleChildIds }
        }).sort({ requestedAt: -1 });

        console.log(`   Found ${requests.length} requests`);
        res.status(200).json(requests);
    } catch (err) {
        console.error(`❌ Error in getChildRequests:`, err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
