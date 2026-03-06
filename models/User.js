// ─────────────────────────────────────────────
// User Schema
// Handles donors and medical staff accounts
// ─────────────────────────────────────────────

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ───────── Basic Profile ─────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password in queries
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // ───────── Role & Blood Information ─────────
    role: {
      type: String,
      enum: {
        values: ["donor", "medical"],
        message: "Role must be donor or medical",
      },
      required: [true, "Role is required"],
    },

    bloodGroup: {
      type: String,
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        message: "Invalid blood group",
      },
      required: function () {
        return this.role === "donor";
      },
    },

    // ───────── Geo Location (GeoJSON) ─────────
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    // Whether donor is currently available
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // ───────── Donation Eligibility ─────────
    lastDonationDate: {
      type: Date,
      default: null,
    },

    eligibilityStatus: {
      type: String,
      enum: ["eligible", "ineligible"],
      default: "eligible",
    },

    nextEligibleDate: {
      type: Date,
      default: null,
    },

    // ───────── Reputation Metrics ─────────
    reliabilityScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    completedDonations: {
      type: Number,
      default: 0,
    },

    responseRate: {
      type: Number,
      default: 100,
    },

    totalRequestsReceived: {
      type: Number,
      default: 0,
    },

    totalRequestsAccepted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────

// Geo index for location based donor search
userSchema.index({ location: "2dsphere" });

// Optimized filtering for donor search
userSchema.index({
  role: 1,
  isAvailable: 1,
  bloodGroup: 1,
  eligibilityStatus: 1,
});

// Fast lookup by email


// ─────────────────────────────────────────────
// Password Hashing Middleware
// ─────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────
// Password Comparison Method
// ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────────
// Model Export
// ─────────────────────────────────────────────
const User = mongoose.model("User", userSchema);

module.exports = User;