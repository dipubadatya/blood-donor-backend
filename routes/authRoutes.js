// ─────────────────────────────────────────────
// Authentication Routes
// Handles user registration, login and profile
// ─────────────────────────────────────────────

const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// ───────── Public Routes ─────────

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

// ───────── Protected Routes ─────────

// Get current logged-in user
router.get("/me", protect, getMe);

// Update user profile
router.put("/update", protect, updateProfile);

// ───────── Export Router ─────────
module.exports = router;