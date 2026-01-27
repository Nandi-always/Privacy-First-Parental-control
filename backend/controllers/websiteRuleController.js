const WebsiteRule = require("../models/WebsiteRule");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Child = require("../models/Child");

// Create a website rule
exports.createWebsiteRule = async (req, res) => {
    try {
        const { childId, website, isBlocked, category, blockReason, allowedTimeSlots } = req.body;

        const websiteRule = new WebsiteRule({
            child: childId,
            parent: req.user.id,
            website,
            isBlocked: isBlocked !== undefined ? isBlocked : true,
            category: category || "other",
            blockReason: blockReason || "Blocked by parent",
            allowedTimeSlots: allowedTimeSlots || []
        });

        await websiteRule.save();

        // Notify child
        const child = await Child.findById(childId);
        if (child) {
            const childUser = await User.findOne({ email: child.email });
            if (childUser) {
                const notif = new Notification({
                    senderId: req.user.id,
                    receiverId: childUser._id,
                    type: "website_rule",
                    message: `Parent ${isBlocked ? 'blocked' : 'allowed'} website: ${website}`,
                    isRead: false
                });
                await notif.save();
            }
        }

        res.status(201).json({ message: "Website rule created", websiteRule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get all website rules for a child
exports.getWebsiteRules = async (req, res) => {
    try {
        const { childId } = req.params;
        const rules = await WebsiteRule.find({ child: childId, parent: req.user.id });
        res.status(200).json(rules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Update a website rule
exports.updateWebsiteRule = async (req, res) => {
    try {
        const { ruleId } = req.params;
        const { website, isBlocked, category, blockReason, allowedTimeSlots } = req.body;

        const rule = await WebsiteRule.findById(ruleId);
        if (!rule) return res.status(404).json({ message: "Rule not found" });
        if (rule.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (website !== undefined) rule.website = website;
        if (isBlocked !== undefined) rule.isBlocked = isBlocked;
        if (category !== undefined) rule.category = category;
        if (blockReason !== undefined) rule.blockReason = blockReason;
        if (allowedTimeSlots !== undefined) rule.allowedTimeSlots = allowedTimeSlots;
        rule.updatedAt = new Date();

        await rule.save();

        res.status(200).json({ message: "Website rule updated", rule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Delete a website rule
exports.deleteWebsiteRule = async (req, res) => {
    try {
        const { ruleId } = req.params;
        const rule = await WebsiteRule.findById(ruleId);

        if (!rule) return res.status(404).json({ message: "Rule not found" });
        if (rule.parent.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await WebsiteRule.findByIdAndDelete(ruleId);
        res.status(200).json({ message: "Website rule deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Check if website is allowed (called by child device)
exports.checkWebsiteAccess = async (req, res) => {
    try {
        const { childId } = req.params;
        const { website } = req.query;

        if (!website) {
            return res.status(400).json({ message: "Website parameter required" });
        }

        // Find matching rule
        const rule = await WebsiteRule.findOne({
            child: childId,
            website: { $regex: new RegExp(website, 'i') }
        });

        if (!rule) {
            // No rule found, allow by default
            return res.status(200).json({
                allowed: true,
                message: "No restriction found"
            });
        }

        // Check if blocked
        if (rule.isBlocked) {
            // Check time-based restrictions
            if (rule.allowedTimeSlots && rule.allowedTimeSlots.length > 0) {
                const now = new Date();
                const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
                const currentTime = now.toTimeString().slice(0, 5);

                const allowedSlot = rule.allowedTimeSlots.find(slot => {
                    if (slot.day !== currentDay) return false;
                    const start = new Date(`1970-01-01T${slot.startTime}`);
                    const end = new Date(`1970-01-01T${slot.endTime}`);
                    const current = new Date(`1970-01-01T${currentTime}`);
                    return current >= start && current <= end;
                });

                if (allowedSlot) {
                    return res.status(200).json({
                        allowed: true,
                        message: "Allowed during current time slot"
                    });
                }
            }

            // Blocked - log attempt
            rule.attemptCount += 1;
            rule.lastAttempt = new Date();
            await rule.save();

            return res.status(200).json({
                allowed: false,
                blocked: true,
                reason: rule.blockReason,
                category: rule.category
            });
        }

        res.status(200).json({ allowed: true, message: "Website allowed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Log blocked website attempt (for tracking)
exports.logBlockedAttempt = async (req, res) => {
    try {
        const { childId } = req.params;
        const { website } = req.body;

        const rule = await WebsiteRule.findOne({
            child: childId,
            website: { $regex: new RegExp(website, 'i') }
        });

        if (rule) {
            rule.attemptCount += 1;
            rule.lastAttempt = new Date();
            await rule.save();
        }

        res.status(200).json({ message: "Attempt logged" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get blocked attempt statistics
exports.getBlockedAttempts = async (req, res) => {
    try {
        const { childId } = req.params;
        const rules = await WebsiteRule.find({
            child: childId,
            parent: req.user.id,
            attemptCount: { $gt: 0 }
        }).sort({ attemptCount: -1 });

        res.status(200).json({
            totalAttempts: rules.reduce((sum, r) => sum + r.attemptCount, 0),
            blockedSites: rules
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
