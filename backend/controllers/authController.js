
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    // Validate required fields
    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Create organization slug
    const slug =
      organizationName.toLowerCase().trim().replace(/\s+/g, "-") +
      "-" +
      Date.now();

    // Create organization
    const organization = await Organization.create({
      name: organizationName,
      slug,
      createdBy: user._id
    });

    // Create organization admin membership
    await Membership.create({
      userId: user._id,
      organizationId: organization._id,
      tenantId: null,
      role: "ORG_ADMIN"
    });

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },

      organization: {
        id: organization._id,
        name: organization.name
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};


// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive"
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};
