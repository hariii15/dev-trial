export default function PremiumCard({ pricing }) {
  if (!pricing) return null;

  const data = pricing.pricing ?? pricing;
  const plan = pricing.plan ?? 'basic';

  const coverageMap = {
    basic: 200,
    standard: 400,
    premium: 700
  };

  const coverage = coverageMap[plan.toLowerCase()] || 200;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Weekly Premium</h3>
      </div>
      <p className="premium-value">₹{data.premium?.toFixed?.(2) ?? "-"}</p>
      <div className="plan-info">
        <strong>Plan:</strong> {plan.charAt(0).toUpperCase() + plan.slice(1)} (₹{coverage}/day coverage)
      </div>
      <p className="coverage-text">
        This plan protects up to ₹{coverage} per disruption day, with a weekly payout cap of ₹2000.
      </p>
      <div className="breakdown-grid">
        <div>
          <span className="label">Base Price</span>
          <span>₹{data.breakdown?.base_price}</span>
        </div>
        <div>
          <span className="label">Plan Multiplier</span>
          <span>{data.breakdown?.plan_multiplier}</span>
        </div>
        <div>
          <span className="label">Risk Factor</span>
          <span>{data.breakdown?.risk_factor}</span>
        </div>
        <div>
          <span className="label">Context Factor</span>
          <span>{data.breakdown?.context_factor}</span>
        </div>
        <div>
          <span className="label">Discount</span>
          <span>{(data.breakdown?.discount ?? 0) * 100}%</span>
        </div>
      </div>
    </div>
  );
}
