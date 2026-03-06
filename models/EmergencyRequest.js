// ─────────────────────────────────────────────
// Emergency Request Schema
// Stores hospital blood requests and donor matches
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    // Hospital that created the request
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Requested blood group
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },

    // Number of blood units required
    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
    },

    // Priority level of request
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "critical"],
      default: "medium",
    },

    // GeoJSON location of the hospital/request
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Optional message from hospital
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Request lifecycle status
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },

    // Donor who accepted the request
    matchedDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Timestamps for request progress
    acceptedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────

// Geo index to support nearby request queries
emergencyRequestSchema.index({ location: "2dsphere" });

// Used when fetching requests by hospital and status
emergencyRequestSchema.index({ hospital: 1, status: 1 });

// Used for sorting latest requests
emergencyRequestSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────
// Model Export
// ─────────────────────────────────────────────

const EmergencyRequest = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);

module.exports = EmergencyRequest;