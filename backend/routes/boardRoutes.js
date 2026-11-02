
import express from "express";

import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard
} from "../controllers/boardController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenantAccess } from "../middleware/tenantMiddleware.js";

const router = express.Router();

// All board routes require login
router.use(protect);

// Create board
router.post(
  "/:organizationId/:tenantId",
  requireTenantAccess,
  createBoard
);

// Get all boards
router.get(
  "/:organizationId/:tenantId",
  requireTenantAccess,
  getBoards
);

// Get one board
router.get(
  "/:organizationId/:tenantId/:boardId",
  requireTenantAccess,
  getBoardById
);

// Update board
router.put(
  "/:organizationId/:tenantId/:boardId",
  requireTenantAccess,
  updateBoard
);

// Archive board
router.delete(
  "/:organizationId/:tenantId/:boardId",
  requireTenantAccess,
  deleteBoard
);

export default router;
