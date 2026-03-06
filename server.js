
// ─────────────────────────────────────────────
// Real-time Blood Donor Tracking System
// ─────────────────────────────────────────────

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

// ─────────────────────────────────────────────
// Load Environment Variables
// ─────────────────────────────────────────────
dotenv.config();

// ─────────────────────────────────────────────
// Database Connection
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// Express App Initialization
// ─────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────
// Socket.io Setup
// ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// make socket instance accessible in routes/controllers
app.set("io", io);

// ─────────────────────────────────────────────
// Socket Connection Handling
// ─────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined notification room`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────────
// Security + Performance Middleware
// ─────────────────────────────────────────────

// security headers
app.use(helmet());

// enable compression
app.use(compression());

// request logging
app.use(morgan("dev"));

// cors configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // max requests per IP
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use("/api", apiLimiter);

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/medical", require("./routes/medicalRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/emergency", require("./routes/emergencyRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// ─────────────────────────────────────────────
// Health Check Route
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    project: "LifeLink — Real Time Blood Donor Tracker",
    status: "Server running",
  });
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ─────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────
process.on("SIGINT", () => {
  console.log("Server shutting down...");
  server.close(() => {
    process.exit(0);
  });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`LifeLink API running on http://localhost:${PORT}`);
});