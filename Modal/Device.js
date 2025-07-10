import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
});

const Device = mongoose.model("Device", deviceSchema);

export default Device;
