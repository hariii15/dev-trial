import express from "express";
import cors from "cors";
import riskRoutes from "./routes/riskRoutes.js";
import featureBuilderRoutes from "./routes/featureBuilderRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import { requestLogger } from "./middleware/requestLogger.js";

const app = express();
app.get("/health", (req, res) => res.json({ ok: true }));
app.use(cors());
app.use(express.json());

// logs incoming request body + response status + duration
app.use(requestLogger);

app.use("/api/risk", riskRoutes);
app.use("/api/feature-builder", featureBuilderRoutes);
app.use("/api/pricing", pricingRoutes);

export default app;