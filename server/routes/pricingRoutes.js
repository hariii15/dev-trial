import express from "express";
import { calculatePricing } from "../controllers/pricingController.js";

const router = express.Router();

// POST /api/pricing/calculate
router.post("/calculate", calculatePricing);

export default router;