import express from "express";
import { clientHTML } from "../Controllers/clientApp.js";

const router = express.Router();

// Routes
router.get("/", clientHTML);

export default router;
