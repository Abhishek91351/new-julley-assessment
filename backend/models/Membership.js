
import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      default: null
    },

    role: {
      type: String,
      enum: [
        "ORG_ADMIN",
        "TENANT_ADMIN",
        "MEMBER"
      ],
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate membership for the same user and tenant.
membershipSchema.index(
  {
    userId: 1,
    organizationId: 1,
    tenantId: 1
  },
  {
    unique: true
  }
);

const Membership = mongoose.model(
  "Membership",
  membershipSchema
);

export default Membership;
