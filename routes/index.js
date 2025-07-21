import express from "express";
import organizationRoutes from "./organizationRoutes.js";
import videoUrlRoutes from "./videoUrlRoutes.js";
import userRoutes from "./userRoutes.js"
import clientAppRoutes from "./clientAppRoutes.js"

const router = express.Router();

// Mount all routes here
router.use("/organizations", organizationRoutes);
router.use("/vdo", videoUrlRoutes);
router.use("/user", userRoutes);
router.use("/client", clientAppRoutes);

export default router;
