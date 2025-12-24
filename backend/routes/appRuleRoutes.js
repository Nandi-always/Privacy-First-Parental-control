const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createAppRule,
  getAppRules,
  updateAppRule,
  deleteAppRule
} = require("../controllers/appRuleController");

// Create app rule for a child
router.post("/:childId/rules", authMiddleware, createAppRule);

// Get all rules for a child
router.get("/:childId/rules", authMiddleware, getAppRules);

// Update an app rule
router.put("/rules/:ruleId", authMiddleware, updateAppRule);

// Delete an app rule
router.delete("/rules/:ruleId", authMiddleware, deleteAppRule);

module.exports = router;
