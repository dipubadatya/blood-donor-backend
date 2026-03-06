// ─────────────────────────────────────────────
// Emergency Request Routes
// Handles blood emergency request workflow
// ─────────────────────────────────────────────

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createEmergencyRequest,
  getEmergencyRequests,
  getEmergencyHistory,
  acceptRequest,
  completeRequest,
  cancelRequest,
  rateDonor,
} = require("../controllers/emergencyController");

// All routes below require authentication
router.use(protect);

// ───────── Emergency Requests ─────────

// Create a new emergency request
router.post("/", createEmergencyRequest);

// Get active emergency requests
router.get("/", getEmergencyRequests);

// Get completed request history
router.get("/history", getEmergencyHistory);

// ───────── Request Actions ─────────

// Donor accepts request
router.put("/:requestId/accept", acceptRequest);

// Medical staff marks request as completed
router.put("/:requestId/complete", completeRequest);

// Cancel an emergency request
router.put("/:requestId/cancel", cancelRequest);

// Medical staff rates donor after completion
router.post("/:requestId/rate", rateDonor);

// ───────── Export Router ─────────
module.exports = router;