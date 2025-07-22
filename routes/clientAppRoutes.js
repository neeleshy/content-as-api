import express from "express";
import { clientHTML, registerHTML } from "../Controllers/clientApp.js";

const router = express.Router();

// Routes
router.get("/", clientHTML);
router.get("/register", registerHTML);

export default router;
