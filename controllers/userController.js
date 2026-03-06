

// ─────────────────────────────────────────────
// User Controller
// Handles profile, availability and location
// ─────────────────────────────────────────────


const User = require("../models/User");

// ─────────────────────────────────────────────
// Toggle Donor Availability
// ─────────────────────────────────────────────
const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isAvailable = !user.isAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Availability ${user.isAvailable ? "enabled" : "disabled"} successfully`,
      isAvailable: user.isAvailable,
    });

  } catch (error) {
    console.error("Toggle availability error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating availability",
    });
  }
};

// ─────────────────────────────────────────────
// Update User Location
// ─────────────────────────────────────────────
const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Longitude and latitude are required",
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: "Coordinates must be valid numbers",
      });
    }

    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Coordinates out of valid range",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: user.location,
    });

  } catch (error) {
    console.error("Update location error:", error);

    res.status(500).json({
      success: false,
      message: "Server error updating location",
    });
  }
};

// ─────────────────────────────────────────────
// Update Basic Profile
// ─────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updateFields = {};

    if (name && name.trim()) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: formatUser(user),
    });

  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

// ─────────────────────────────────────────────
// Get Current User Profile
// ─────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -__v")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: formatUser(user),
    });

  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

// ─────────────────────────────────────────────
// Helper: Format user response
// ─────────────────────────────────────────────
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  bloodGroup: user.bloodGroup,
  location: user.location,
  isAvailable: user.isAvailable,
  reliabilityScore: user.reliabilityScore,
  eligibilityStatus: user.eligibilityStatus,
  nextEligibleDate: user.nextEligibleDate,
  lastDonationDate: user.lastDonationDate,
  completedDonations: user.completedDonations,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────
// Export Controller Functions
// ─────────────────────────────────────────────
module.exports = {
  toggleAvailability,
  updateLocation,
  updateProfile,
  getProfile,
};
