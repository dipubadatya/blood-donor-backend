// ─────────────────────────────────────────────
// Medical Routes
// Used by hospitals / medical staff
// ─────────────────────────────────────────────

const express = require("express");
const router = express.Router();

const { searchDonors, getDonorStats } = require("../controllers/medicalController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All routes below require authentication
router.use(protect);

// Restrict access to medical role only
router.use(authorize("medical"));

// ───────── Donor Search ─────────

// Search nearby donors by location and blood group
router.get("/search", searchDonors);

// Get donor availability statistics
router.get("/stats", getDonorStats);

// ───────── Export Router ─────────
module.exports = router;