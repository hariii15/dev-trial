import express from "express";
import { getRiskPrediction } from "../controllers/riskController.js";

const router = express.Router();

router.post("/predict", getRiskPrediction);

export default router;