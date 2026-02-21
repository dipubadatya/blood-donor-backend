

const User = require("../models/User");

// Search nearby available donors based on blood group and radius
const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, longitude, latitude, distance } = req.query;

    // Validate required search parameters
    if (!bloodGroup) {
      return res.status(400).json({ success: false, message: "Blood group is required" });
    }
    if (!longitude || !latitude) {
      return res.status(400).json({ success: false, message: "Location coordinates are required" });
    }

    const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validGroups.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: "Invalid blood group type" });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ success: false, message: "Coordinates must be numeric" });
    }

    // Geographic boundary validation
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({ success: false, message: "Coordinates out of range" });
    }

    // Radius logic: default 5km, clamped between 1km and 50km
    let maxDistance = parseInt(distance) || 5000;
    maxDistance = Math.max(1000, Math.min(maxDistance, 50000));

    // MongoDB GeoSpatial query for nearby available donors
    const donors = await User.find({
      role: "donor",
      bloodGroup: bloodGroup,
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance,
        },
      },
    }).select("-password -__v");

    // Map distances for the frontend
    const donorsWithDistance = donors.map((donor) => {
      const donorData = donor.toObject();
      const dist = calculateDistance(
        lat,
        lng,
        donor.location.coordinates[1],
        donor.location.coordinates[0]
      );

      donorData.distanceInMeters = Math.round(dist);
      donorData.distanceInKm = parseFloat((dist / 1000).toFixed(2));
      return donorData;
    });

    // Explicitly sort by proximity
    donorsWithDistance.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

    res.status(200).json({
      success: true,
      count: donorsWithDistance.length,
      searchParams: {
        bloodGroup,
        radiusInKm: parseFloat((maxDistance / 1000).toFixed(2)),
      },
      donors: donorsWithDistance,
    });
  } catch (error) {
    console.error("Search Donors Error:", error);
    if (error.code === 16755) {
      return res.status(400).json({ success: false, message: "Invalid geospatial format" });
    }
    res.status(500).json({ success: false, message: "Internal server error during search" });
  }
};

// Aggregated stats for available inventory
const getDonorStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          role: "donor",
          isAvailable: true,
        },
      },
      {
        $group: {
          _id: "$bloodGroup",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalAvailable = stats.reduce((sum, s) => sum + s.count, 0);
    const totalDonors = await User.countDocuments({ role: "donor" });

    res.status(200).json({
      success: true,
      totalDonors,
      totalAvailable,
      bloodGroupBreakdown: stats.map((s) => ({
        bloodGroup: s._id,
        available: s.count,
      })),
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ success: false, message: "Error fetching statistics" });
  }
};

// Helper: Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = { searchDonors, getDonorStats };
