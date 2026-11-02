
import express from "express";

import {
  createOrganization,
  getMyOrganizations
} from "../controllers/organizationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All organization routes require authentication
router.use(protect);

// Create organization
router.post("/", createOrganization);

// Get my organizations
router.get("/my", getMyOrganizations);

export default router;
