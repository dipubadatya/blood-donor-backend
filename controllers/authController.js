
// module.exports = { register, login, getMe, updateProfile };
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token for authentication
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register new user (Donor or Medical)
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, bloodGroup, longitude, latitude } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    if (role === "donor" && !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Blood group is required for donors",
      });
    }

    // Initialize GeoJSON location object
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
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// Authenticate user credentials
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
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
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// Update profile details
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bloodGroup } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bloodGroup && user.role === "donor") user.bloodGroup = bloodGroup;

    await user.save();

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
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Server error updating profile" });
  }
};

// Get profile of current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

module.exports = { register, login, getMe, updateProfile };
