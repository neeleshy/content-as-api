import express from "express";

import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "../Controllers/organizationController.js";
import verifyAPIKey from "../Middleware/verifyAPIKey.js";

const router = express.Router();
// Middleware
router.use(verifyAPIKey);
// Routes
router.post("/", createOrganization);
router.get("/", getAllOrganizations);
router.get("/:id", getOrganizationById);
router.put("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);

export default router;
