
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    // Membership must be loaded by an earlier middleware
    if (!req.membership) {
      return res.status(403).json({
        success: false,
        message: "Membership not found"
      });
    }

    if (!allowedRoles.includes(req.membership.role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action"
      });
    }

    next();
  };
};
