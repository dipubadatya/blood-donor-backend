// ─────────────────────────────────────────────
// MongoDB Database Connection
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected successfully: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    // Exit the process if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;