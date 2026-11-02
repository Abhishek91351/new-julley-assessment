
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_MOVED",
        "TASK_DELETED",
      ],
      required: true,
    },

    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

activityLogSchema.index({
  organizationId: 1,
  tenantId: 1,
  boardId: 1,
  createdAt: -1,
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
