import mongoose from "mongoose";

const columnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
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

    position: {
      type: Number,
      required: true,
      default: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Efficiently retrieve columns in board order
columnSchema.index({
  organizationId: 1,
  tenantId: 1,
  boardId: 1,
  position: 1
});

const Column = mongoose.model("Column", columnSchema);

export default Column;