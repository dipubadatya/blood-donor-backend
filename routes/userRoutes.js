const express = require("express");
const router = express.Router();
const {
  toggleAvailability,
  updateLocation,
  updateProfile,
  getProfile,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All user routes require a valid token
router.use(protect);

// General profile routes
router.get("/profile", getProfile);
router.put("/update-profile", updateProfile);

// Specific actions for donor accounts
router.put("/toggle-availability", authorize("donor"), toggleAvailability);
router.put("/update-location", authorize("donor"), updateLocation);

module.exports = router;