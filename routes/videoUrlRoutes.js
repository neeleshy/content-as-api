import express from "express";

import { getPlayableUrl } from "../Controllers/videoUrlController.js";

const router = express.Router();

// Routes
router.get("/:videoId", getPlayableUrl);

export default router;
