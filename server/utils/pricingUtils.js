import { PRICING_RULES } from "../services/pricingRules.js";

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Returns a multiplier in range ~[1..(1+risk_multiplier_factor)]
export const calculateRiskFactor = (gwdi_score) => {
  const g = Number(gwdi_score);
  if (!Number.isFinite(g)) throw new Error("gwdi_score must be a number");
  return 1 + clamp(g, 0, 1) * PRICING_RULES.risk_multiplier_factor;
};

// Context factor is a multiplier that increases premium when individual risk components are high.
// This makes pricing more explainable and sensitive to operational disruptions.
export const calculateContextFactor = ({
  rain_risk,
  heat_risk,
  pollution_risk,
  activity_risk
}) => {
  const r = clamp(Number(rain_risk ?? 0), 0, 1);
  const h = clamp(Number(heat_risk ?? 0), 0, 1);
  const p = clamp(Number(pollution_risk ?? 0), 0, 1);
  const a = clamp(Number(activity_risk ?? 0), 0, 1);

  const t = PRICING_RULES.context;

  let contextBoost = 0;

  if (a >= t.activity_high_threshold) contextBoost += t.activity_boost;
  if (p >= t.pollution_high_threshold) contextBoost += t.pollution_boost;
  if (h >= t.heat_high_threshold) contextBoost += t.heat_boost;
  if (r >= t.rain_high_threshold) contextBoost += t.rain_boost;

  // Also add a small smooth component so it changes gradually
  // (activity is weighted more because it impacts deliveries most in this system)
  const smooth = 0.10 * a + 0.04 * p + 0.03 * h + 0.03 * r;

  return 1 + contextBoost + smooth;
};

// Discount multiplier to be applied at the end.
// Returns a fraction (0..max_discount)
export const calculateDiscount = (trust_score) => {
  const t = Number(trust_score ?? 0);
  if (!Number.isFinite(t)) throw new Error("trust_score must be a number");
  return clamp(t, 0, 1) * PRICING_RULES.max_discount;
};
