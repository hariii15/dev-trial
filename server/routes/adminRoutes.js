import express from "express";
import { runClaimsEngine } from "../controllers/adminController.js";

const router = express.Router();

// POST /api/admin/run-claims
router.post("/run-claims", runClaimsEngine);

export default router;
