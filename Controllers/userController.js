import jwt from "jsonwebtoken";
import User from "../Modal/Users.js";
import Organization from "../Modal/Organization.js";

export const registerUser = async (req, res) => {
  try {
    const organizationKey = req?.header("x-organization-key");
    const { user_id } = req?.body;
    const userAgent = req?.headers["user-agent"] || req?.get("User-Agent");

    // 1. Validate required data
    if (!organizationKey || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Find organization by API key
    const organization = await Organization.findOne({
      apiKey: organizationKey,
    });
    if (!organization) {
      return res.status(404).json({ error: "Invalid organization key" });
    }

    const currentDate = new Date();
    const subscriptionEndDate = new Date(organization.createdAt);
    subscriptionEndDate.setDate(
      subscriptionEndDate.getDate() + organization.period
    );

    if (currentDate > subscriptionEndDate) {
      return res.status(403).json({ error: "Subscription expired" });
    }

    // 3. Check if max user limit reached
    const userCount = await User.countDocuments({ organizationKey });
    const existingUser = await User.findOne({
      userID: user_id,
      organizationKey,
    });

    if (userCount >= organization.maxUsers && !existingUser) {
      return res
        .status(403)
        .json({ error: "User limit exceeded for this organization" });
    }

    const payload = { organizationKey, userID: user_id, userAgent };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. Check if user is already registered
    if (existingUser) {
      const deviceIndex = existingUser.devices.findIndex(
        (d) => d.userAgent === userAgent
      );

      if (
        deviceIndex === -1 &&
        organization.maxDevices <= existingUser.devices.length
      ) {
        return res
          .status(403)
          .json({ error: "Device limit exceeded for this user" });
      } else if (deviceIndex !== -1) {
        existingUser.devices[deviceIndex].refreshToken = refreshToken;
        await existingUser.save();
        return res.status(200).json({
          accessToken: accessToken,
          refreshToken: refreshToken,
          lastUsedAt: new Date(),
        });
      } else if (organization.maxDevices > existingUser.devices.length) {
        existingUser.devices.push({ userAgent, refreshToken });
        await existingUser.save();
        return res.status(200).json({
          accessToken: accessToken,
          refreshToken: refreshToken,
          createdAt: new Date(),
          lastUsedAt: new Date(),
        });
      }
    }

    // 5. Generate tokens

    // 6. Save user with device object
    if (!existingUser) {
      const newUser = new User({
        userID: user_id,
        organizationKey,
        devices: [
          {
            userAgent,
            refreshToken,
            createdAt: new Date(),
            lastUsedAt: new Date(),
          },
        ],
      });
      await newUser.save();

      // 7. Send response
      return res.status(201).json({
        accessToken,
        refreshToken,
        message: "User registered successfully",
      });
    }
  } catch (err) {
    console.error("Error in registerUser:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.headers["authorization"];
    const userAgent = req.headers["user-agent"];

    if (!oldRefreshToken || !userAgent) {
      return res.status(401).json({ message: "Token or device info missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ message: "Token expired or invalid" });
    }

    const { organizationKey, userID } = decoded;

    const user = await User.findOne({ userID, organizationKey });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const deviceIndex = user.devices.findIndex(
      (d) => d.userAgent === userAgent && d.refreshToken === oldRefreshToken
    );

    if (deviceIndex === -1) {
      // Device is either new or token is replaced
      const org = await Organization.findOne({ apiKey: organizationKey });
      if (!org) {
        return res.status(400).json({ message: "Invalid organization" });
      }

      if (user.devices.length >= org.maxDevices) {
        return res.status(403).json({ message: "Device limit exceeded" });
      }
    }

    // Issue new tokens
    const newAccessToken = jwt.sign(
      { userID, organizationKey, userAgent },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const newRefreshToken = jwt.sign(
      { userID, organizationKey, userAgent },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (deviceIndex !== -1) {
      // Replace token for existing device
      user.devices[deviceIndex].refreshToken = newRefreshToken;
      user.devices[deviceIndex].lastUsedAt = new Date();
    } else {
      // Register new device
      user.devices.push({
        userAgent,
        refreshToken: newRefreshToken,
        createdAt: new Date(),
        lastUsedAt: new Date(),
      });
    }

    await user.save();

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
