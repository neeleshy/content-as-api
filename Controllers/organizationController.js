import Organization from "../Modal/Organization.js";
import generateApiKey from "../utils/generateApiKey.js";

// Create a new organization
export const createOrganization = async (req, res) => {
  try {
    const { name, maxDevices } = req.body;
    const apiKey = generateApiKey();

    const org = await Organization.create({
      name,
      apiKey,
      maxDevices,
    });

    res.status(201).json({ success: true, data: org });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all organizations
export const getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.status(200).json({ success: true, data: orgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single organization by ID
export const getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update organization
export const updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    res.status(200).json({ success: true, data: org });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete organization
export const deleteOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
