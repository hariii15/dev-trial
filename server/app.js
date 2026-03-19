import express from "express";
import cors from "cors";
import riskRoutes from "./routes/riskRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/risk", riskRoutes);

export default app;