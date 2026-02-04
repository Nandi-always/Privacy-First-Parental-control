const express = require("express");
const router = express.Router();
const { register, login, verifyToken } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Verify Token route
router.get("/verify", authMiddleware, verifyToken);

module.exports = router;
