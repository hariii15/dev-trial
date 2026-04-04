export default function PremiumCard({ pricing, risk }) {
  if (!pricing) return null;

  const data = pricing.pricing ?? pricing;
  const plan = pricing.plan ?? 'basic';

  const coverageMap = {
    basic: 200,
    standard: 400,
    premium: 700
  };

  const coverage = coverageMap[plan.toLowerCase()] || 200;

  // Get high risk triggers
  const getHighRisks = () => {
    if (!risk) return [];
    const breakdown = risk?.data?.breakdown ?? risk?.data?.gwdi?.breakdown ?? risk?.breakdown ?? {};
    const triggers = [];
    if ((breakdown.rain ?? breakdown.rain_risk ?? 0) > 0.6) triggers.push("Heavy Rain");
    if ((breakdown.pollution ?? breakdown.pollution_risk ?? 0) > 0.6) triggers.push("Severe Pollution");
    if ((breakdown.activity ?? breakdown.activity_risk ?? 0) > 0.7) triggers.push("Activity Collapse");
    if ((breakdown.heat ?? breakdown.heat_risk ?? 0) > 0.6) triggers.push("Extreme Heat");
    return triggers;
  };

  const highRisks = getHighRisks();
  const gwdi = risk?.data?.gwdi_score ?? risk?.data?.gwdi?.gwdi_score ?? risk?.gwdi_score;

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
      {highRisks.length > 0 && gwdi > 0.3 && (
        <p className="risk-note">
          Premium is higher today because {highRisks.join(", ").toLowerCase()} risk{highRisks.length > 1 ? 's are' : ' is'} elevated and GWDI is {gwdi?.toFixed(2)}.
        </p>
      )}
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
