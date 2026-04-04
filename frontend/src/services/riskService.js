import api from "./api";

export const checkCurrentRisk = async ({ zone, time }) => {
  const res = await api.post("/feature-builder/predict", { zone, time });
  return res.data;
};
