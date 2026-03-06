

// module.exports = { register, login, getMe, updateProfile };

// ─────────────────────────────────────────────
// Authentication Controller
// Handles user registration, login, and profile
// ─────────────────────────────────────────────


const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────
// Generate JWT Token
// ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ─────────────────────────────────────────────
// Register New User (Donor / Medical)
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      bloodGroup,
      longitude,
      latitude,
    } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // donors must provide blood group
    if (role === "donor" && !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Blood group is required for donors",
      });
    }

    // prepare GeoJSON location object
    const location = {
      type: "Point",
      coordinates: [
        parseFloat(longitude) || 0,
        parseFloat(latitude) || 0,
      ],
    };

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      role,
      bloodGroup: role === "donor" ? bloodGroup : undefined,
      location,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: formatUser(user),
    });

  } catch (error) {
    // mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ─────────────────────────────────────────────
// Login User
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: formatUser(user),
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ─────────────────────────────────────────────
// Update User Profile
// ─────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bloodGroup } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    if (bloodGroup && user.role === "donor") {
      user.bloodGroup = bloodGroup;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: formatUser(user),
    });

  } catch (error) {
    console.error("Profile update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

// ─────────────────────────────────────────────
// Get Current Logged In User
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

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


module.exports = { register, login, getMe, updateProfile };

// ─────────────────────────────────────────────
// Helper: Format user response
// (keeps response structure consistent)
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
});

// ─────────────────────────────────────────────
// Export Controllers
// ─────────────────────────────────────────────
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};

