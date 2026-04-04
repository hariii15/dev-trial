import api from "./api";

export const runClaimsEngine = async (triggered_by = "admin-frontend") => {
  const res = await api.post("/admin/run-claims", { triggered_by });
  return res.data;
};
