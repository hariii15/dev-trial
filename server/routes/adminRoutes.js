import express from "express";
import { runClaimsEngine, runClaimTest } from "../controllers/adminController.js";

const router = express.Router();

// POST /api/admin/run-claims
router.post("/run-claims", runClaimsEngine);

// POST /api/admin/run-claim-test/:userId
router.post("/run-claim-test/:userId", runClaimTest);

export default router;
