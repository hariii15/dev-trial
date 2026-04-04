// Central place for business constants used by the pricing engine.

export const PRICING_RULES = {
  // Base price in INR
  base_price: 20,

  // Customer plan multipliers
  plan_multipliers: {
    basic: 1.0,
    standard: 1.25,
    premium: 1.6
  },

  // Risk factor scaling based on GWDI (0..1)
  // final risk factor = 1 + gwdi_score * risk_multiplier_factor
  risk_multiplier_factor: 1.5,

  // Clamp limits for premium
  premium_limits: {
    min: 10,
    max: 200
  },

  // Context adjustment thresholds (tunable)
  context: {
    activity_high_threshold: 0.7,
    activity_boost: 0.25,

    pollution_high_threshold: 0.7,
    pollution_boost: 0.10,

    heat_high_threshold: 0.7,
    heat_boost: 0.08,

    rain_high_threshold: 0.7,
    rain_boost: 0.07
  },

  // Trust score discount (0..1)
  // discount = trust_score * max_discount
  max_discount: 0.20
};
