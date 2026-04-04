import { PRICING_RULES } from "./pricingRules.js";
import {
  calculateRiskFactor,
  calculateContextFactor,
  calculateDiscount,
  clamp
} from "../utils/pricingUtils.js";

export const calculatePremium = async (input = {}) => {
  const {
    gwdi_score,
    plan,
    rain_risk,
    heat_risk,
    pollution_risk,
    activity_risk,
    trust_score
  } = input;

  const base_price = PRICING_RULES.base_price;

  const normalizedPlan = String(plan ?? "basic").toLowerCase();
  const plan_multiplier = PRICING_RULES.plan_multipliers[normalizedPlan];
  if (!plan_multiplier) {
    const err = new Error(`Invalid plan '${plan}'. Use one of: ${Object.keys(PRICING_RULES.plan_multipliers).join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const risk_factor = calculateRiskFactor(gwdi_score);
  const context_factor = calculateContextFactor({ rain_risk, heat_risk, pollution_risk, activity_risk });
  const discount = calculateDiscount(trust_score);

  const preDiscountPremium = base_price * plan_multiplier * risk_factor * context_factor;
  const premiumRaw = preDiscountPremium * (1 - discount);

  const premium = clamp(
    Number(premiumRaw.toFixed(2)),
    PRICING_RULES.premium_limits.min,
    PRICING_RULES.premium_limits.max
  );

  return {
    premium,
    breakdown: {
      base_price,
      plan_multiplier,
      risk_factor: Number(risk_factor.toFixed(4)),
      context_factor: Number(context_factor.toFixed(4)),
      discount: Number(discount.toFixed(4))
    }
  };
};
