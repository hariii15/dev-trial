export default function RiskCard({ risk }) {
  if (!risk) return null;

  const gwdi = risk?.data?.gwdi_score ?? risk?.data?.gwdi?.gwdi_score ?? risk?.gwdi_score;
  const level = risk?.data?.risk_level ?? risk?.data?.gwdi?.risk_level ?? risk?.risk_level;
  const breakdown =
    risk?.data?.breakdown ?? risk?.data?.gwdi?.breakdown ?? risk?.breakdown ?? {};

  const getLevelClass = () => {
    if (level === "LOW") return "badge badge-low";
    if (level === "MEDIUM") return "badge badge-medium";
    if (level === "HIGH") return "badge badge-high";
    return "badge";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Current Risk</h3>
        <span className={getLevelClass()}>{level}</span>
      </div>
      <p className="gwdi-score">GWDI: {gwdi?.toFixed?.(3) ?? "-"}</p>
      <div className="breakdown-grid">
        <div>
          <span className="label">Rain</span>
          <span>{(breakdown.rain ?? breakdown.rain_risk ?? 0).toFixed(3)}</span>
        </div>
        <div>
          <span className="label">Heat</span>
          <span>{(breakdown.heat ?? breakdown.heat_risk ?? 0).toFixed(3)}</span>
        </div>
        <div>
          <span className="label">Pollution</span>
          <span>{(breakdown.pollution ?? breakdown.pollution_risk ?? 0).toFixed(3)}</span>
        </div>
        <div>
          <span className="label">Activity</span>
          <span>{(breakdown.activity ?? breakdown.activity_risk ?? 0).toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}
