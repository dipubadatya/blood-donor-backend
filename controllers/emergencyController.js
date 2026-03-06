// ─────────────────────────────────────────────
// Emergency Request Controller
// Handles blood emergency workflow
// ─────────────────────────────────────────────

const EmergencyRequest = require("../models/EmergencyRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ─────────────────────────────────────────────
// Create Emergency Request (Medical only)
// ─────────────────────────────────────────────
exports.createEmergencyRequest = async (req, res) => {
  try {
    const { bloodGroup, unitsRequired, urgencyLevel, location, message } = req.body;

    if (req.user.role !== "medical") {
      return res.status(403).json({
        success: false,
        message: "Only medical staff can create emergency requests",
      });
    }

    const mappedUrgency = urgencyLevel === "high" ? "critical" : urgencyLevel;

    const request = await EmergencyRequest.create({
      hospital: req.user._id,
      bloodGroup,
      unitsRequired,
      urgencyLevel: mappedUrgency,
      location: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
      message,
    });

    const populatedRequest = await EmergencyRequest.findById(request._id)
      .populate("hospital", "name email phone location");

    const io = req.app.get("io");

    if (io) {
      const nearbyDonors = await User.find({
        role: "donor",
        bloodGroup: bloodGroup,
        isAvailable: true,
        eligibilityStatus: "eligible",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [location.longitude, location.latitude],
            },
            $maxDistance: 10000, // 10km radius
          },
        },
      });

      for (const donor of nearbyDonors) {
        io.to(donor._id.toString()).emit("emergency_created", {
          request: populatedRequest,
        });

        await Notification.create({
          recipient: donor._id,
          sender: req.user._id,
          type: "emergency",
          title: "Critical Blood Request",
          message: `Emergency request for ${bloodGroup} blood at ${req.user.name}.`,
          relatedEntity: request._id,
          entityModel: "EmergencyRequest",
        });
      }
    }

    res.status(201).json({
      success: true,
      data: populatedRequest,
    });

  } catch (error) {
    console.error("Create emergency request error:", error);

    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─────────────────────────────────────────────
// Get Active Requests
// ─────────────────────────────────────────────
exports.getEmergencyRequests = async (req, res) => {
  try {
    let query = { status: "pending" };

    if (req.user.role === "medical") {
      query = {
        hospital: req.user._id,
        status: { $in: ["pending", "accepted", "completed"] },
      };
    }

    if (req.user.role === "donor") {
      query = {
        bloodGroup: req.user.bloodGroup,
        status: { $in: ["pending", "accepted"] },
      };
    }

    const requests = await EmergencyRequest.find(query)
      .populate("hospital", "name email phone location")
      .populate("matchedDonor", "name phone bloodGroup reliabilityScore")
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      success: true,
      data: requests,
    });

  } catch (error) {
    console.error("Get emergency requests error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─────────────────────────────────────────────
// Get Completed Requests History
// ─────────────────────────────────────────────
exports.getEmergencyHistory = async (req, res) => {
  try {
    let query = { status: "completed" };

    if (req.user.role === "medical") {
      query.hospital = req.user._id;
    }

    if (req.user.role === "donor") {
      query.matchedDonor = req.user._id;
    }

    const history = await EmergencyRequest.find(query)
      .populate("hospital", "name email phone location")
      .populate("matchedDonor", "name phone bloodGroup reliabilityScore")
      .sort("-completedAt")
      .lean();

    res.status(200).json({
      success: true,
      data: history,
    });

  } catch (error) {
    console.error("Get history error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─────────────────────────────────────────────
// Accept Request (Donor)
// ─────────────────────────────────────────────
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (req.user.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can accept requests",
      });
    }

    const request = await EmergencyRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    request.status = "accepted";
    request.matchedDonor = req.user._id;
    request.acceptedAt = new Date();
    await request.save();

    const io = req.app.get("io");

    if (io) {
      const populatedRequest = await EmergencyRequest.findById(request._id)
        .populate("hospital", "name email phone location")
        .populate("matchedDonor", "name phone bloodGroup location reliabilityScore");

      io.to(request.hospital.toString()).emit("request_accepted", {
        request: populatedRequest,
      });

      await Notification.create({
        recipient: request.hospital,
        sender: req.user._id,
        type: "accepted",
        title: "Donor Found",
        message: `${req.user.name} accepted your emergency request`,
        relatedEntity: request._id,
        entityModel: "EmergencyRequest",
      });

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalRequestsAccepted: 1 },
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });

  } catch (error) {
    console.error("Accept request error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─────────────────────────────────────────────
// Complete Request (Medical)
// ─────────────────────────────────────────────
exports.completeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (req.user.role !== "medical") {
      return res.status(403).json({
        success: false,
        message: "Only medical staff can complete requests",
      });
    }

    const request = await EmergencyRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "completed";
    request.completedAt = new Date();
    await request.save();

    if (request.matchedDonor) {
      const donationDate = new Date();
      const nextEligibleDate = new Date();
      nextEligibleDate.setDate(donationDate.getDate() + 56);

      await User.findByIdAndUpdate(request.matchedDonor, {
        lastDonationDate: donationDate,
        nextEligibleDate,
        eligibilityStatus: "ineligible",
        $inc: { completedDonations: 1 },
      });

      const io = req.app.get("io");

      if (io) {
        io.to(request.matchedDonor.toString()).emit("request_completed", {
          request,
        });

        await Notification.create({
          recipient: request.matchedDonor,
          sender: req.user._id,
          type: "completed",
          title: "Donation Complete",
          message: "Thank you for your donation!",
          relatedEntity: request._id,
          entityModel: "EmergencyRequest",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: request,
    });

  } catch (error) {
    console.error("Complete request error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─────────────────────────────────────────────
// Cancel Request
// ─────────────────────────────────────────────
exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (req.user.role !== "medical") {
      return res.status(403).json({
        success: false,
        message: "Only medical staff can cancel requests",
      });
    }

    const request = await EmergencyRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed request",
      });
    }

    request.status = "cancelled";
    await request.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("request_completed", { request });
    }

    res.status(200).json({
      success: true,
      message: "Request cancelled",
    });

  } catch (error) {
    console.error("Cancel request error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─────────────────────────────────────────────
// Rate Donor
// ─────────────────────────────────────────────
exports.rateDonor = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rating } = req.body;

    if (req.user.role !== "medical") {
      return res.status(403).json({
        success: false,
        message: "Only medical staff can rate donors",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const request = await EmergencyRequest.findById(requestId);

    if (!request || request.status !== "completed" || !request.matchedDonor) {
      return res.status(400).json({
        success: false,
        message: "Invalid request for rating",
      });
    }

    const donor = await User.findById(request.matchedDonor);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    const currentScore = donor.reliabilityScore || 100;
    const newScore = Math.round((currentScore + rating * 20) / 2);

    donor.reliabilityScore = newScore;
    await donor.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted",
      reliabilityScore: newScore,
    });

  } catch (error) {
    console.error("Rate donor error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};