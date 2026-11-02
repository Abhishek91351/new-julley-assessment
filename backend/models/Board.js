import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
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

    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Efficiently find boards belonging to a tenant
boardSchema.index({
  organizationId: 1,
  tenantId: 1,
  createdAt: -1
});

const Board = mongoose.model("Board", boardSchema);

export default Board;