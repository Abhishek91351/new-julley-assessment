
import Membership from "../models/Membership.js";
import Organization from "../models/Organization.js";

export const requireOrgAdmin = async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findOne({
      _id: organizationId,
      isActive: true
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    const membership = await Membership.findOne({
      userId: req.user._id,
      organizationId,
      tenantId: null,
      role: "ORG_ADMIN",
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Only organization admins can perform this action"
      });
    }

    req.organization = organization;
    req.membership = membership;

    next();

  } catch (error) {
    console.error("Organization Authorization Error:", error);

    res.status(500).json({
      success: false,
      message: "Organization authorization failed"
    });
  }
};
