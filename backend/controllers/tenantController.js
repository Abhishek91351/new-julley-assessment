
import Tenant from "../models/Tenant.js";
import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";

// CREATE TENANT (BRANCH)
export const createTenant = async (req, res) => {
  try {
    const { name, location } = req.body;
    const { organizationId } = req.params;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Branch name is required"
      });
    }

    // Check organization exists
    const organization = await Organization.findById(
      organizationId
    );

    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Check duplicate branch name
    const existingTenant = await Tenant.findOne({
      organizationId,
      name: name.trim()
    });

    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: "Branch already exists"
      });
    }

    const tenant = await Tenant.create({
      name: name.trim(),
      location,
      organizationId
    });

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      tenant
    });

  } catch (error) {
    console.error("Create Tenant Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create branch"
    });
  }
};


// GET ACCESSIBLE TENANTS
export const getTenants = async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Find all memberships of this user in this organization
    const memberships = await Membership.find({
      userId: req.user._id,
      organizationId,
      isActive: true
    });

    if (memberships.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this organization"
      });
    }

    // Organization admin can access every branch
    const isOrgAdmin = memberships.some(
      (membership) => membership.role === "ORG_ADMIN"
    );

    let tenants;

    if (isOrgAdmin) {
      tenants = await Tenant.find({
        organizationId,
        isActive: true
      });
    } else {
      // Other users can access only their assigned branches
      const tenantIds = memberships
        .filter((membership) => membership.tenantId)
        .map((membership) => membership.tenantId);

      tenants = await Tenant.find({
        _id: { $in: tenantIds },
        organizationId,
        isActive: true
      });
    }

    res.status(200).json({
      success: true,
      count: tenants.length,
      tenants
    });

  } catch (error) {
    console.error("Get Tenants Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch branches"
    });
  }
};
