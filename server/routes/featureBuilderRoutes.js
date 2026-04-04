import express from "express";
import { predictFromZoneTime } from "../controllers/featureBuilderController.js";

const router = express.Router();

// POST /api/feature-builder/predict
// Body: { zone: "Indiranagar", time: "18:00" }
router.post("/predict", predictFromZoneTime);

export default router;
