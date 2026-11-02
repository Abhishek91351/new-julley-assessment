
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireTenantAccess } from "../middleware/tenantMiddleware.js";
import { getBoardActivities } from "../controllers/activityController.js";

const router = express.Router();

router.use(protect);

router.get(
  "/:organizationId/:tenantId/:boardId",
  requireTenantAccess,
  getBoardActivities
);

export default router;
