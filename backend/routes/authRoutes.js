
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser
} from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User authenticated successfully",
    user: req.user
  });
});

export default router;
