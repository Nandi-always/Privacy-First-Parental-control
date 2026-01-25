const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log('❌ No token provided for:', req.method, req.path);
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('✅ User authenticated:', decoded.id, decoded.role);
    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};
