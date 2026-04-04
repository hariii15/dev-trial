import { processAllClaims, runClaimTest as runClaimTestService } from "../services/claimsProcessorService.js";

export const runClaimsEngine = async (req, res) => {
  try {
    const { triggered_by } = req.body || {};

    const summary = await processAllClaims({
      triggeredBy: triggered_by || "manual-admin"
    });

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error("runClaimsEngine failed", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to run claims engine"
    });
  }
};

export const runClaimTest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { gwdi_score, activity } = req.body || {};

    const result = await runClaimTestService({
      userId,
      gwdi_score,
      activity,
      triggeredBy: "admin-test"
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("runClaimTest failed", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to run test claim"
    });
  }
};