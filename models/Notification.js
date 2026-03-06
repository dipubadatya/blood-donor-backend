// ─────────────────────────────────────────────
// Notification Schema
// Stores real-time and system notifications
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // User who will receive the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User who triggered the notification
    // Can be null for system generated notifications
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification category
    type: {
      type: String,
      enum: ["emergency", "accepted", "completed", "system"],
      required: true,
    },

    // Short heading for notification
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Detailed notification message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Read / unread status
    isRead: {
      type: Boolean,
      default: false,
    },

    // Dynamic reference to related entity
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entityModel",
    },

    // Model name for dynamic reference
    entityModel: {
      type: String,
      enum: ["EmergencyRequest", "User"],
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────

// Fast lookup for user's notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Quickly filter unread notifications
notificationSchema.index({ recipient: 1, isRead: 1 });

// ─────────────────────────────────────────────
// Model Export
// ─────────────────────────────────────────────

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;