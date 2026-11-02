import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Membership from "../models/Membership.js";
import Tenant from "../models/Tenant.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // 1. Authenticate socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user || !user.isActive) {
        return next(new Error("User not found or inactive"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // 2. Handle authenticated connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    // 3. Join a tenant room only after checking membership
    socket.on("joinTenant", async ({ organizationId, tenantId }, callback) => {
      try {
        if (!organizationId || !tenantId) {
          return callback?.({
            success: false,
            message: "Organization ID and Tenant ID are required",
          });
        }

        const tenant = await Tenant.findOne({
          _id: tenantId,
          organizationId,
          isActive: true,
        });

        if (!tenant) {
          return callback?.({
            success: false,
            message: "Tenant not found",
          });
        }

        const membership = await Membership.findOne({
          userId: socket.user._id,
          organizationId,
          isActive: true,
          $or: [
            { tenantId },
            { tenantId: null, role: "ORG_ADMIN" },
          ],
        });

        if (!membership) {
          return callback?.({
            success: false,
            message: "You don't have access to this tenant",
          });
        }

        const room = `tenant:${tenantId}`;

        await socket.join(room);

        console.log(`${socket.user.name} joined ${room}`);

        callback?.({
          success: true,
          message: "Joined tenant room successfully",
          room,
        });
      } catch (error) {
        console.error("Join tenant error:", error.message);

        callback?.({
          success: false,
          message: "Failed to join tenant room",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export default initializeSocket;