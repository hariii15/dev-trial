import { predictRisk } from "../services/riskService.js";

export const getRiskPrediction = async (req, res) => {
  try {
    const result = await predictRisk(req.body);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};