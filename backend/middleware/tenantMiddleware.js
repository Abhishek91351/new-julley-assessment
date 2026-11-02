
import Membership from "../models/Membership.js";
import Tenant from "../models/Tenant.js";

export const requireTenantAccess = async (req, res, next) => {
  try {
    const { organizationId, tenantId } = req.params;

    if (!organizationId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Tenant ID are required"
      });
    }

    // Verify that tenant belongs to this organization
    const tenant = await Tenant.findOne({
      _id: tenantId,
      organizationId,
      isActive: true
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found in this organization"
      });
    }

    // Check tenant-specific membership OR organization admin
    const membership = await Membership.findOne({
      userId: req.user._id,
      organizationId,
      isActive: true,
      $or: [
        { tenantId },
        {
          tenantId: null,
          role: "ORG_ADMIN"
        }
      ]
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this tenant"
      });
    }

    // Attach verified context
    req.tenant = tenant;
    req.membership = membership;
    req.organizationId = organizationId;
    req.tenantId = tenantId;

    next();

  } catch (error) {
    console.error("Tenant Access Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify tenant access"
    });
  }
};
