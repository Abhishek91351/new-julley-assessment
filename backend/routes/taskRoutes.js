
import express from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenantAccess } from "../middleware/tenantMiddleware.js";

const router = express.Router();

router.use(protect);

// Create task
router.post(
  "/:organizationId/:tenantId/:boardId",
  requireTenantAccess,
  createTask
);

// Get all tasks
router.get(
  "/:organizationId/:tenantId/:boardId",
  requireTenantAccess,
  getTasks
);

// Get one task
router.get(
  "/:organizationId/:tenantId/:boardId/:taskId",
  requireTenantAccess,
  getTaskById
);

// Update task
router.put(
  "/:organizationId/:tenantId/:boardId/:taskId",
  requireTenantAccess,
  updateTask
);

// Archive task
router.delete(
  "/:organizationId/:tenantId/:boardId/:taskId",
  requireTenantAccess,
  deleteTask
);

export default router;
