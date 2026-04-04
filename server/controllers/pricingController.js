import { buildFeaturesAndPredict } from "../services/featureBuilderService.js";
import { calculatePremium } from "../services/pricingService.js";

export const calculatePricing = async (req, res) => {
  try {
    const { zone, time, plan, trust_score } = req.body ?? {};

    if (!zone || typeof zone !== "string") {
      return res.status(400).json({ success: false, message: "'zone' is required" });
    }
    if (!time || typeof time !== "string") {
      return res.status(400).json({ success: false, message: "'time' is required (HH:MM) format" });
    }
    if (!plan || typeof plan !== "string") {
      return res.status(400).json({ success: false, message: "'plan' is required" });
    }

    // 1) Get GWDI + breakdown by calling feature builder (internally)
    const gwdi = await buildFeaturesAndPredict({ zone, time, requestId: req.requestId });

    // 2) Convert GWDI response to pricing engine input
    const pricingInput = {
      gwdi_score: gwdi.gwdi_score,
      plan,
      rain_risk: gwdi.breakdown?.rain,
      heat_risk: gwdi.breakdown?.heat,
      pollution_risk: gwdi.breakdown?.pollution,
      activity_risk: gwdi.breakdown?.activity,
      trust_score
    };

    // 3) Calculate premium
    const pricing = await calculatePremium(pricingInput);

    // 4) Return combined response (pricing + model explanation)
    return res.status(200).json({
      success: true,
      data: {
        zone,
        time,
        plan,
        trust_score: trust_score ?? null,
        gwdi: {
          gwdi_score: gwdi.gwdi_score,
          risk_level: gwdi.risk_level,
          breakdown: gwdi.breakdown
        },
        pricing
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};