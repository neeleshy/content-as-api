import express from "express";
import { refreshToken, registerUser } from "../Controllers/userController.js";

const router = express.Router();

// Routes
router.post("/register", registerUser);
router.get("/refresh", refreshToken);

export default router;
