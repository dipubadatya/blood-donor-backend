const express = require("express");
const router = express.Router();
const { register, login, getMe,updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Route
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile); 
module.exports = router;