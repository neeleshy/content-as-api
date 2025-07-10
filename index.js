import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

import apiRoutes from "./routes/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.set("trust proxy", true); // So req.ip works correctly

// API Routes
app.use("/api", apiRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(3000, () => console.log("Server running on port 3000"));
});
