const express = require("express");
const router = express.Router();
const { searchDonors, getDonorStats } = require("../controllers/medicalController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Middleware to protect all routes and restrict access to medical personnel
router.use(protect);
router.use(authorize("medical"));

// Search for nearby donors based on location and blood group
router.get("/search", searchDonors);

// Get general statistics on donor availability
router.get("/stats", getDonorStats);

module.exports = router;