export default function PremiumCard({ pricing }) {
  if (!pricing) return null;

  const data = pricing.data ?? pricing;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Weekly Premium</h3>
      </div>
      <p className="premium-value">₹{data.premium?.toFixed?.(2) ?? "-"}</p>
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
