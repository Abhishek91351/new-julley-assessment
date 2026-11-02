
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import Membership from "../models/Membership.js";

// Add an existing user to a tenant
export const addTenantMember = async (req, res) => {
  try {
    const { organizationId, tenantId } = req.params;
    const { email, role } = req.body;

    // Validate input
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required"
      });
    }

    // Only allow tenant-level roles
    if (!["TENANT_ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Use TENANT_ADMIN or MEMBER"
      });
    }

    // Check tenant belongs to this organization
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

    // Find existing user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      isActive: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. They must register first."
      });
    }

    // Create or update tenant membership
    const membership = await Membership.findOneAndUpdate(
      {
        userId: user._id,
        organizationId,
        tenantId
      },
      {
        $set: {
          role,
          isActive: true
        },
        $setOnInsert: {
          userId: user._id,
          organizationId,
          tenantId
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    ).populate("userId", "name email");

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      membership
    });

  } catch (error) {
    console.error("Add Tenant Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message
    });
  }
};

// Get all members of a tenant
export const getTenantMembers = async (req, res) => {
  try {
    const { organizationId, tenantId } = req.params;

    const memberships = await Membership.find({
      organizationId,
      tenantId,
      isActive: true
    }).populate("userId", "name email");

    return res.status(200).json({
      success: true,
      count: memberships.length,
      members: memberships
    });

  } catch (error) {
    console.error("Get Tenant Members Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get tenant members",
      error: error.message
    });
  }
};
