import express from "express";
import { analyzeNews } from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/", analyzeNews);

export default router;
