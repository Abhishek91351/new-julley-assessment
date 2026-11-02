
import express from "express";

import {
  createTenant,
  getTenants
} from "../controllers/tenantController.js";
import {
  addTenantMember,
  getTenantMembers
} from "../controllers/membershipController.js";

import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requireTenantAccess } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

import {
  requireOrgAdmin
} from "../middleware/organizationMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create branch - only organization admin
router.post(
  "/:organizationId",
  requireOrgAdmin,
  createTenant
);

// Get branches accessible to logged-in user
router.get(
  "/:organizationId",
  getTenants
);

// Add a member to a tenant (ORG_ADMIN only)
router.post(
  "/:organizationId/:tenantId/members",
  requireOrgAdmin,
  addTenantMember
);

// Get tenant members (ORG_ADMIN or TENANT_ADMIN)
router.get(
  "/:organizationId/:tenantId/members",
  requireTenantAccess,
  authorizeRoles("ORG_ADMIN", "TENANT_ADMIN"),
  getTenantMembers
);

export default router;
