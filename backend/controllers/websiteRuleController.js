const WebsiteRule = require("../models/WebsiteRule");
const Notification = require("../models/Notification");
const Child = require("../models/Child");
const User = require("../models/User");

// Helper to resolve childId (can be from Child or User collection) to User ID
async function resolveToUserId(childId) {
    try {
        console.log(`🔍 Resolving childId: ${childId}`);
        const child = await Child.findById(childId);
        if (child) {
            console.log(`   Found Child record for email: ${child.email}`);
            const user = await User.findOne({ email: child.email });
            if (user) {
                console.log(`   Resolved to User ID: ${user._id}`);
                return user._id;
            }
        } else {
            console.log(`   No Child record found for ID: ${childId}, assuming it is a User ID`);
        }
    } catch (e) {
        console.log(`   Resolution error (likely already a User ID): ${e.message}`);
    }
    return childId;
}

// Create a website rule
exports.createWebsiteRule = async (req, res) => {
    try {
        const { childId, website, isBlocked, category, blockReason, allowedTimeSlots } = req.body;

        // Resolve actual User ID if childId refers to a Child collection record
        let resolvedChildId = childId;
        const childRecord = await Child.findById(childId);
        if (childRecord) {
            const childUser = await User.findOne({ email: childRecord.email });
            if (childUser) resolvedChildId = childUser._id;
        }

        const websiteRule = new WebsiteRule({
            child: resolvedChildId,
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

        // Lookup by both just in case
        const rules = await WebsiteRule.find({
            $or: [{ child: childId }, { child: await resolveToUserId(childId) }],
            parent: req.user.id
        });
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
        let { website } = req.query;

        console.log(`🔍 Checking website access for childId: ${childId}, site: ${website}`);

        if (!website) {
            return res.status(400).json({ message: "Website parameter required" });
        }

        // --- 1. ID Resolution (Cross-check User and Child collections) ---
        const allPossibleChildIds = [childId];
        try {
            // Find correspondencies to ensure we check all possible IDs rules could be saved under
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
        console.log(`   Searching rules for all linked IDs:`, allPossibleChildIds);

        // --- 2. Normalize Website for Matching ---
        let requestedDomain = website.toLowerCase();
        try {
            if (website.includes('://')) {
                requestedDomain = new URL(website).hostname;
            } else if (website.includes('/')) {
                requestedDomain = website.split('/')[0];
            }
        } catch (e) { }
        requestedDomain = requestedDomain.replace(/^www\./, '');
        console.log(`   Normalized check domain: ${requestedDomain}`);

        // --- 3. Find Matching Rules ---
        const rules = await WebsiteRule.find({
            child: { $in: allPossibleChildIds }
        });

        console.log(`   Found ${rules.length} total rules for this child.`);

        // Find match
        const matchingRule = rules.find(rule => {
            const ruleSite = rule.website.toLowerCase().replace(/^www\./, '').replace(/https?:\/\//, '');
            return requestedDomain === ruleSite ||
                requestedDomain.endsWith('.' + ruleSite) ||
                requestedDomain.includes(ruleSite) ||
                ruleSite.includes(requestedDomain);
        });

        if (!matchingRule) {
            console.log(`   ✅ No matching rule. Allowing.`);
            return res.status(200).json({ allowed: true, message: "No restriction found" });
        }

        console.log(`   🚩 Found rule: ${matchingRule.website} (isBlocked: ${matchingRule.isBlocked})`);

        // --- 4. Block Check ---
        if (matchingRule.isBlocked) {
            // Time Check
            if (matchingRule.allowedTimeSlots && matchingRule.allowedTimeSlots.length > 0) {
                const now = new Date();
                const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
                const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

                const allowedSlot = matchingRule.allowedTimeSlots.find(slot => {
                    if (slot.day !== currentDay) return false;
                    return currentTime >= slot.startTime && currentTime <= slot.endTime;
                });

                if (allowedSlot) {
                    console.log(`   ✅ Within allowed slot.`);
                    return res.status(200).json({ allowed: true, message: "Allowed during time slot" });
                }
            }

            // Still blocked - Log statistics
            matchingRule.attemptCount = (matchingRule.attemptCount || 0) + 1;
            matchingRule.lastAttempt = new Date();
            await matchingRule.save();

            console.log(`   🚫 Blocked: ${matchingRule.blockReason}`);
            return res.status(200).json({
                allowed: false,
                blocked: true,
                reason: matchingRule.blockReason,
                category: matchingRule.category
            });
        }

        console.log(`   ✅ Explicitly allowed.`);
        res.status(200).json({ allowed: true, message: "Website allowed" });
    } catch (err) {
        console.error('❌ Error in checkWebsiteAccess:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Log blocked website attempt (for tracking)
exports.logBlockedAttempt = async (req, res) => {
    try {
        const { childId } = req.params;
        const { website } = req.body;

        const userId = await resolveToUserId(childId);
        const rule = await WebsiteRule.findOne({
            $or: [{ child: childId }, { child: userId }],
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
        const userId = await resolveToUserId(childId);

        const rules = await WebsiteRule.find({
            $or: [{ child: childId }, { child: userId }],
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
