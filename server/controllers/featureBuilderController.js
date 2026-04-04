import { buildFeaturesAndPredict } from "../services/featureBuilderService.js";

export const predictFromZoneTime = async (req, res) => {
  try {
    const result = await buildFeaturesAndPredict({
      ...req.body,
      requestId: req.requestId
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "Feature builder controller error",
        requestId: req.requestId,
        error: err.message,
        time: new Date().toISOString()
      })
    );

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};