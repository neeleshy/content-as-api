import jwt from "jsonwebtoken";
import axios from "axios";
import Organization from "../Modal/Organization.js";
import User from "../Modal/Users.js";

export const getPlayableUrl = async (req, res) => {
  try {
    const { videoId } = req.params;
    const accessToken = req.headers.authorization;
    const userAgent = req.headers["user-agent"] || req.get("User-Agent");
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.connection.remoteAddress;

    // 1. Verify token
    let payload;
    try {
      payload = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Access token expired or invalid" });
    }

    const { userID, organizationKey } = payload;

    // 2. Check organization
    const organization = await Organization.findOne({
      apiKey: organizationKey,
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // 3. Check user
    const user = await User.findOne({ userID, organizationKey });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found in organization" });
    }

    // 4. Device check: allow based on (userAgent + IP) combo
    const currentDevice = userAgent;
    const deviceIndex = user.devices.findIndex(
      (d) => d.userAgent === currentDevice
    );
    const deviceExists = deviceIndex !== -1;

    if (!deviceExists) {
      if (user.devices.length < organization.maxDevices) {
        user.devices.push(currentDevice);
        await user.save();
      } else {
        return res.status(403).json({ message: "Device limit exceeded" });
      }
    }

    // 5. Call VdoCipher API
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

    // 6. Respond with iframe URL
    return res.status(200).json({
      iframeSrc: `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`,
    });
  } catch (error) {
    console.error("Error in getPlayableUrl:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
