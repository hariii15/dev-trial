import api from "./api";

export const runClaimsEngine = async (triggered_by = "admin-frontend") => {
  const res = await api.post("/admin/run-claims", { triggered_by });
  return res.data;
};

export const runClaimTest = async (userId, body) => {
  const res = await api.post(`/admin/run-claim-test/${userId}`, body);
  return res.data;
};
