import express from "express";
import organizationRoutes from "./organizationRoutes.js";
import videoUrlRoutes from "./videoUrlRoutes.js";

const router = express.Router();

// Mount all routes here
router.use("/organizations", organizationRoutes);
router.use("/vdo", videoUrlRoutes);

export default router;
