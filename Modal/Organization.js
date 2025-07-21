import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
    length: 50,
  },
  maxUsers: {
    type: Number,
    required: true,
  },
  maxDevices: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
