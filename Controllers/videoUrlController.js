import axios from "axios";
import Organization from "../Modal/Organization.js";
import Device from "../Modal/Device.js";

export const getVideoUrlById = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const organization_key = req.headers["x-organization-key"];
    const ip = req.headers["x-forwarded-for"] || req.ip;
    const deviceInactiveTimeout = 48 * 60 * 60 * 1000;

    if (!videoId || !organization_key) {
      return res
        .status(400)
        .json({ message: "Missing videoId or organization_key" });
    }

    const organization = await Organization.findOne({
      apiKey: organization_key,
    });

    if (!organization) {
      return res.status(401).json({ message: "Invalid organization_key" });
    }

    const activeDevicesCount = await Device.countDocuments({
      organizationId: organization._id,
      isActive: true,
    });

    let device = await Device.findOne({ ip, organizationId: organization._id });
    const isDeviceLimitReached = activeDevicesCount >= organization.maxDevices;

    // Helper to deactivate the oldest inactive device (older than 48 hrs)
    const replaceOldestInactiveDeviceIfAny = async () => {
      const oldDevices = await Device.find({
        organizationId: organization._id,
        isActive: true,
        lastAccessed: { $lt: new Date(Date.now() - deviceInactiveTimeout) },
      }).sort({ lastAccessed: 1 }); // oldest first

      if (!oldDevices.length) return false;

      // deactivate oldest one
      oldDevices[0].isActive = false;
      await oldDevices[0].save();
      return true;
    };

    let shouldSave = false;
    
    if (!device) {
      if (!isDeviceLimitReached || (await replaceOldestInactiveDeviceIfAny())) {
        device = await Device.create({
          ip,
          organizationId: organization._id,
          isActive: true,
          lastAccessed: new Date(),
        });
      } else {
        return res.status(429).json({
          message: "Device limit exceeded. Try again after 48 hours.",
        });
      }
    } else if (!device.isActive) {
      if (!isDeviceLimitReached || (await replaceOldestInactiveDeviceIfAny())) {
        device.isActive = true;
        shouldSave = true;
      } else {
        return res.status(429).json({
          message: "Device is inactive and no free slot is available.",
        });
      }
    } else {
      // Already active device — just update timestamp
      shouldSave = true;
    }

    // Update lastAccessed once
    if (shouldSave) {
      device.lastAccessed = new Date();
      await device.save();
    }

    // Request VdoCipher OTP
    const vdoResponse = await axios.post(
      `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
      {
        allow: [ip],
        ttl: 300,
      },
      {
        headers: {
          Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { otp, playbackInfo } = vdoResponse.data;

    if (!otp || !playbackInfo) {
      return res
        .status(500)
        .json({ message: "Invalid response from VdoCipher" });
    }

    return res.status(200).json({
      iframeSrc: `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`,
    });
  } catch (error) {
    console.error("getVideoUrlById error:", error);

    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "Internal Server Error";

    return res.status(status).json({ message });
  }
};
