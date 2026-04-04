import express from "express";
import { runClaimsEngine, runClaimForUser, runTestClaimForUser} from "../controllers/adminController.js";

const router = express.Router();

// POST /api/admin/run-claims  (all users)
router.post("/run-claims", runClaimsEngine);

// POST /api/admin/run-claim/:userId  (single user)
router.post("/run-claim/:userId", runClaimForUser);
router.post("/run-claim-test/:userId", runTestClaimForUser);

// adminRoutes.js
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "admin" });
});

export default router;
