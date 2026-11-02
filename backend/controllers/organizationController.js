
import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";

// CREATE ORGANIZATION
export const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required"
      });
    }

    const slug =
      name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now();

    const organization = await Organization.create({
      name: name.trim(),
      slug,
      createdBy: req.user._id
    });

    await Membership.create({
      userId: req.user._id,
      organizationId: organization._id,
      tenantId: null,
      role: "ORG_ADMIN"
    });

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization
    });

  } catch (error) {
    console.error("Create Organization Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create organization"
    });
  }
};


// GET MY ORGANIZATIONS
export const getMyOrganizations = async (req, res) => {
  try {
    const memberships = await Membership.find({
      userId: req.user._id,
      isActive: true
    }).populate("organizationId");

    const organizations = memberships
      .map((membership) => membership.organizationId)
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: organizations.length,
      organizations
    });

  } catch (error) {
    console.error("Get Organizations Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch organizations"
    });
  }
};
