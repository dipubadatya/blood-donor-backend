const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// ─── Load Environment Variables ───
dotenv.config();

// ─── Connect to Database ───
connectDB();

// ─── Initialize Express App ───
const app = express();
 
// ─── Global Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/medical", require("./routes/medicalRoutes"));
app.use("/api/user", require("./routes/userRoutes")); // 🆕 Phase 4

// ─── Health Check Route ───
app.get("/", (req, res) => {
  res.json({
    project: "LifeLink — Real Time Blood Donor Tracker",
    status: "API is running",
    phase: "Phase 4 — Donor Dashboard",
  });
});

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ─── Start Server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🩸 LifeLink API running on http://localhost:${PORT}`);
  console.log(`📦 Phase 4: Donor Dashboard — ACTIVE\n`);
});