// ─────────────────────────────────────────────
// Role-Based Authorization Middleware
// Example usage: authorize("medical")
// or authorize("donor", "admin")
// ─────────────────────────────────────────────

const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    // req.user should already be attached by auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};