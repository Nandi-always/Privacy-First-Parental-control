const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/child", require("./routes/childRoutes"));
app.use("/api/rules", require("./routes/appRuleRoutes"));
app.use("/api/screentime", require("./routes/screenTimeRoutes"));
app.use("/api/emergency", require("./routes/emergencyRoutes"));
app.use("/api/location", require("./routes/locationRoutes"));
app.use("/api/downloads", require("./routes/downloadAlertRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("Parental Control Backend Running");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
