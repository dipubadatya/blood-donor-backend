


// ─────────────────────────────────────────────
// Donor Search Controller
// Handles donor discovery and statistics
// ─────────────────────────────────────────────

const User = require("../models/User");

// ─────────────────────────────────────────────
// Search Nearby Donors
// ─────────────────────────────────────────────
const searchDonors = async (req, res) => {
  try {
    const {
      bloodGroup,
      longitude,
      latitude,
      distance,
      minReliability,
      onlyEligible
    } = req.query;

    // Basic validation
    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Blood group is required",
      });
    }

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required",
      });
    }

    const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: "Coordinates must be numeric",
      });
    }

    // Geographic range validation
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Coordinates out of range",
      });
    }

    // Radius: default 5km, range 1km → 50km
    let maxDistance = parseInt(distance) || 5000;
    maxDistance = Math.max(1000, Math.min(maxDistance, 50000));

    // Build MongoDB query
    const query = {
      role: "donor",
      bloodGroup,
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
    };

    if (onlyEligible === "true") {
      query.eligibilityStatus = "eligible";
    }

    if (minReliability) {
      query.reliabilityScore = { $gte: parseInt(minReliability) };
    }

    // Fetch donors
    const donors = await User.find(query)
      .select("-password -__v")
      .lean();

    // Attach distance info
    const donorsWithDistance = donors.map((donor) => {
      const dist = calculateDistance(
        lat,
        lng,
        donor.location.coordinates[1],
        donor.location.coordinates[0]
      );

      donor.distanceInMeters = Math.round(dist);
      donor.distanceInKm = parseFloat((dist / 1000).toFixed(2));

      return donor;
    });

    // Sort by nearest
    donorsWithDistance.sort(
      (a, b) => a.distanceInMeters - b.distanceInMeters
    );

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
    console.error("Search donors error:", error);

    if (error.code === 16755) {
      return res.status(400).json({
        success: false,
        message: "Invalid geospatial query format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────
// Donor Statistics
// ─────────────────────────────────────────────
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

    const totalAvailable = stats.reduce(
      (sum, group) => sum + group.count,
      0
    );

    const totalDonors = await User.countDocuments({
      role: "donor",
    });

    const eligibleDonors = await User.countDocuments({
      role: "donor",
      eligibilityStatus: "eligible",
    });

    res.status(200).json({
      success: true,
      totalDonors,
      totalAvailable,
      eligibleDonors,
      bloodGroupBreakdown: stats.map((group) => ({
        bloodGroup: group._id,
        available: group.count,
      })),
    });

  } catch (error) {
    console.error("Donor stats error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching donor statistics",
    });
  }
};

// ─────────────────────────────────────────────
// Utility: Haversine Distance
// Calculates distance between two coordinates
// ─────────────────────────────────────────────
function calculateDistance(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS = 6371000;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}


module.exports = { searchDonors, getDonorStats };

module.exports = {
  searchDonors,
  getDonorStats,
};
