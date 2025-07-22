import Organization from "../Modal/Organization.js";
import generateApiKey from "../utils/generateApiKey.js";

// Create a new organization
export const createOrganization = async (req, res) => {
  try {
    const { name, max_users, max_devices, period } = req.body;
    const apiKey = generateApiKey();

    const org = await Organization.create({
      name,
      apiKey,
      maxUsers: max_users,
      maxDevices: max_devices,
      period,
    });

    res.status(201).json({ success: true, data: org });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all organizations
export const getAllOrganizations = async (req, res) => {
  res.status(200).json({ message: "Not implemented" });
};

// Get single organization by ID
export const getOrganizationById = async (req, res) => {
  res.status(200).json({ message: "Not implemented" });
};

// Update organization
export const updateOrganization = async (req, res) => {
  res.status(200).json({ message: "Not implemented" });
};

// Delete organization
export const deleteOrganization = async (req, res) => {
  res.status(200).json({ message: "Not implemented" });
};
