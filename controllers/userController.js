// const User = require("../models/User");

// // ──────────────────────────────────────────────
// // @route   PUT /api/user/toggle-availability
// // @desc    Toggle donor availability (available / not available)
// // @access  Private (donor only)
// // ──────────────────────────────────────────────

// const toggleAvailability = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Toggle the boolean
//     user.isAvailable = !user.isAvailable;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: `Availability ${user.isAvailable ? "enabled" : "disabled"} successfully`,
//       isAvailable: user.isAvailable,
//     });
//   } catch (error) {
//     console.error("Toggle Availability Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error toggling availability",
//     });
//   }
// };

// // ──────────────────────────────────────────────
// // @route   PUT /api/user/update-location
// // @desc    Update donor's live GPS location
// // @access  Private (donor only)
// // ──────────────────────────────────────────────

// const updateLocation = async (req, res) => {
//   try {
//     const { longitude, latitude } = req.body;

//     // ─── Validate Coordinates ───
//     if (longitude === undefined || latitude === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Longitude and latitude are required",
//       });
//     }

//     const lng = parseFloat(longitude);
//     const lat = parseFloat(latitude);

//     if (isNaN(lng) || isNaN(lat)) {
//       return res.status(400).json({
//         success: false,
//         message: "Longitude and latitude must be valid numbers",
//       });
//     }

//     if (lng < -180 || lng > 180) {
//       return res.status(400).json({
//         success: false,
//         message: "Longitude must be between -180 and 180",
//       });
//     }

//     if (lat < -90 || lat > 90) {
//       return res.status(400).json({
//         success: false,
//         message: "Latitude must be between -90 and 90",
//       });
//     }

//     // ─── Update Location ───
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         location: {
//           type: "Point",
//           coordinates: [lng, lat],
//         },
//       },
//       { new: true, runValidators: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Location updated successfully",
//       location: user.location,
//     });
//   } catch (error) {
//     console.error("Update Location Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error updating location",
//     });
//   }
// };

// // ──────────────────────────────────────────────
// // @route   PUT /api/user/update-profile
// // @desc    Update donor's profile (name, phone)
// // @access  Private
// // ──────────────────────────────────────────────

// const updateProfile = async (req, res) => {
//   try {
//     const { name, phone } = req.body;

//     const updateFields = {};
//     if (name && name.trim()) updateFields.name = name.trim();
//     if (phone !== undefined) updateFields.phone = phone.trim();

//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid fields to update",
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       updateFields,
//       { new: true, runValidators: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         bloodGroup: user.bloodGroup,
//         location: user.location,
//         isAvailable: user.isAvailable,
//       },
//     });
//   } catch (error) {
//     console.error("Update Profile Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error updating profile",
//     });
//   }
// };

// // ──────────────────────────────────────────────
// // @route   GET /api/user/profile
// // @desc    Get full profile data
// // @access  Private
// // ──────────────────────────────────────────────

// const getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password -__v");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         bloodGroup: user.bloodGroup,
//         location: user.location,
//         isAvailable: user.isAvailable,
//         createdAt: user.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Get Profile Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching profile",
//     });
//   }
// };

// module.exports = {
//   toggleAvailability,
//   updateLocation,
//   updateProfile,
//   getProfile,
// };


const User = require("../models/User");

// Toggle donor availability status
const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Flip the current status
    user.isAvailable = !user.isAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Availability ${user.isAvailable ? "enabled" : "disabled"} successfully`,
      isAvailable: user.isAvailable,
    });
  } catch (error) {
    console.error("Toggle Availability Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error toggling availability",
    });
  }
};

// Update user's live coordinates
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

    // Basic coordinate validation
    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: "Coordinates must be valid numbers",
      });
    }

    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinate ranges",
      });
    }

    // Update the GeoJSON field
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
    console.error("Update Location Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating location",
    });
  }
};

// Update basic profile info
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateFields = {};

    if (name && name.trim()) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bloodGroup: user.bloodGroup,
        location: user.location,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

// Get current user profile details
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bloodGroup: user.bloodGroup,
        location: user.location,
        isAvailable: user.isAvailable,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

module.exports = {
  toggleAvailability,
  updateLocation,
  updateProfile,
  getProfile,
};