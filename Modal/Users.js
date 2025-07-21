import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    userAgent: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    organizationKey: {
      type: String,
      required: true,
      index: true,
    },
    devices: {
      type: [deviceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only exist once per organization
userSchema.index({ userID: 1, organizationKey: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
