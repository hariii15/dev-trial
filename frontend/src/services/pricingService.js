import api from "./api";

export const calculatePremium = async ({ zone, time, plan, trust_score }) => {
  const res = await api.post("/pricing/calculate", {
    zone,
    time,
    plan,
    trust_score
  });
  return res.data;
};
