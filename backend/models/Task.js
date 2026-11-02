
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true
    },

    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      required: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM"
    },

    dueDate: {
      type: Date,
      default: null
    },

    position: {
      type: Number,
      default: 1000
    },

    // Used for optimistic concurrency control
    version: {
      type: Number,
      default: 0
    },

    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Efficient task retrieval and ordering
taskSchema.index({
  organizationId: 1,
  tenantId: 1,
  boardId: 1,
  columnId: 1,
  position: 1
});

// Efficient task assignment lookup
taskSchema.index({
  assignedTo: 1,
  tenantId: 1
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
