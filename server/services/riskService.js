import axios from "axios";
import { AI_BASE_URL } from "../config/aiConfig.js";

export const predictRisk = async (payload) => {
  try {
    const response = await axios.post(
      `${AI_BASE_URL}/predict`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw new Error("AI Prediction Failed");
  }
};