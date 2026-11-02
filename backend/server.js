
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import columnRoutes from "./routes/columnRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import initializeSocket from "./sockets/socketHandler.js";
import activityRoutes from "./routes/activityRoutes.js";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);
app.set("io", io);
// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);
// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Collaborative Kanban API is running"
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 8000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.log("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();
