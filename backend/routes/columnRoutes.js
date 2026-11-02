
import express from "express";

import {
  createColumn,
  getColumns,
  updateColumn,
  deleteColumn
} from "../controllers/columnController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenantAccess } from "../middleware/tenantMiddleware.js";

const router = express.Router();

router.use(protect);

// Create column
router.post(
  "/:organizationId/:tenantId/:boardId",
  requireTenantAccess,
  createColumn
);

// Get columns
router.get(
  "/:organizationId/:tenantId/:boardId",
  requireTenantAccess,
  getColumns
);

// Update column
router.put(
  "/:organizationId/:tenantId/:boardId/:columnId",
  requireTenantAccess,
  updateColumn
);

// Delete column
router.delete(
  "/:organizationId/:tenantId/:boardId/:columnId",
  requireTenantAccess,
  deleteColumn
);

export default router;
