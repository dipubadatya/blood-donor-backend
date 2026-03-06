// ─────────────────────────────────────────────
// Notification Routes
// Handles user notification actions
// ─────────────────────────────────────────────

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

// All notification routes require authentication
router.use(protect);

// ───────── Notification List ─────────

// Get current user's notifications
router.get("/", getNotifications);

// ───────── Notification Actions ─────────

// Mark all notifications as read
router.put("/mark-all-read", markAllAsRead);

// Mark a specific notification as read
router.put("/:notificationId/read", markAsRead);

// ───────── Export Router ─────────
module.exports = router;