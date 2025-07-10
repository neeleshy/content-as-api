import express from "express";

import { getVideoUrlById } from "../Controllers/videoUrlController.js";

const router = express.Router();

// Routes
router.get("/:videoId", getVideoUrlById);

export default router;
