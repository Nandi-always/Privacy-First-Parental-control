const express = require("express");
const router = express.Router();
const {
    createWebsiteRule,
    getWebsiteRules,
    updateWebsiteRule,
    deleteWebsiteRule,
    checkWebsiteAccess,
    logBlockedAttempt,
    getBlockedAttempts
} = require("../controllers/websiteRuleController");
const authMiddleware = require("../middleware/authMiddleware");

// Create website rule
router.post("/", authMiddleware, createWebsiteRule);

// Get all website rules for a child
router.get("/:childId", authMiddleware, getWebsiteRules);

// Check if website is allowed (for child device)
router.get("/:childId/check", authMiddleware, checkWebsiteAccess);

// Get blocked attempt statistics
router.get("/:childId/attempts", authMiddleware, getBlockedAttempts);

// Update website rule
router.put("/:ruleId", authMiddleware, updateWebsiteRule);

// Delete website rule
router.delete("/:ruleId", authMiddleware, deleteWebsiteRule);

// Log blocked attempt
router.post("/:childId/log-attempt", authMiddleware, logBlockedAttempt);

module.exports = router;
