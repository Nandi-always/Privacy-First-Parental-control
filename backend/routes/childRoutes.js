const express = require("express");
const router = express.Router();
const { 
  createChild, 
  getChildren, 
  getChildById,
  updateChild, 
  deleteChild,
  updateAppCategories 
} = require("../controllers/childController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a child
router.post("/", authMiddleware, createChild);

// Get all children
router.get("/", authMiddleware, getChildren);

// Get a specific child
router.get("/:childId", authMiddleware, getChildById);

// Update child info
router.put("/:childId", authMiddleware, updateChild);

// Delete child
router.delete("/:childId", authMiddleware, deleteChild);

// Update app categories
router.put("/:childId/categories", authMiddleware, updateAppCategories);

module.exports = router;
